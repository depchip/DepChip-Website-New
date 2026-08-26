---
title: "Telegram Bots Built Entirely in n8n"
description: "How to wire up a real Telegram bot in n8n, from getting a token out of BotFather to the trigger node's privacy mode gotcha nobody warns you about."
date: 2026-08-20 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, telegram, bots, automation]
series: n8n-tutorials
series_order: 19
---

Discord and Slack both need a webhook or a bot token bolted on before n8n can hear anything happening in them. Telegram is different. It ships with a dedicated Telegram Trigger node, built specifically so a workflow can sit and listen, and that changes the shape of what you can build with it.

## Getting a bot and a token

Every Telegram bot starts the same way: you message BotFather, Telegram's own bot for managing bots, and send it `/newbot`. It asks for a display name and then a username, which has to end in "bot" and can't be changed later, so it's worth picking something you won't regret. BotFather hands back an access token immediately. That token goes into a Telegram credential in n8n, and the same credential works for both the Telegram node and the Telegram Trigger node, since they're really two views onto the same bot.

Treat that token the way you'd treat any other credential. It's not a secret in the sense of a database password, but anyone who has it can send messages and read updates as your bot, so it belongs in n8n's credential store and nowhere near a workflow's plain text.

## Two nodes doing two different jobs

The Telegram node sends things: text messages, photos, documents, locations, stickers, animations. It also handles chat management (getting member lists, leaving a chat, editing a group's title) and file retrieval. The Telegram Trigger node is the other half. It's what starts a workflow when something happens on the Telegram side, whether that's a new message, an edited one, a callback query from an inline button, or a user joining a chat the bot administers.

Left on its default setting, the Trigger listens for "*", which catches nearly everything except chat member updates, message reactions, and reaction counts. Those three need to be added explicitly if you actually want them, which is a reasonable default: most bots care about messages and callback queries, not who reacted to what.

## The privacy setting that quietly breaks group bots

This is the one that catches people who've built Telegram bots before on other platforms and assume the defaults carry over. By default, a Telegram bot in "privacy mode" only receives messages that are direct commands to it, things like `/start` or an @-mention, even inside a group it's already a member of. Ordinary conversation in that group never reaches the bot at all, and the workflow just sits there looking broken with no error to point at.

The fix isn't in n8n. It's back in BotFather: send `/setprivacy` for your bot and switch it to Disabled. Do that before you spend an hour checking your webhook, your credential, and your trigger configuration for a bug that isn't there. It's a Telegram-level setting, not something n8n's node can override from its side.

## Webhooks, reverse proxies, and the one-webhook rule

The Telegram Trigger node registers a webhook with Telegram behind the scenes, and that comes with two constraints worth knowing about before you hit them blind. If n8n sits behind a reverse proxy, the `WEBHOOK_URL` environment variable has to be set to the actual public HTTPS address your instance is reachable at, or Telegram has nowhere valid to deliver updates. And if the node seems permanently stuck waiting for a test event, the usual cause is a reverse proxy that isn't passing websocket traffic through, since the manual "listen for test event" flow depends on a websocket connection back to the editor.

The other constraint is more structural: Telegram only lets a bot register a single webhook at a time. Activate a production workflow and then flip into "listen for test event" mode, and you'll overwrite the production webhook with the test one, silently breaking whatever was live. Two practical ways around it: deactivate the production workflow while you're testing changes, or keep a second bot token dedicated to your dev instance so the two never fight over the same webhook slot.

## Actually building something with it

A minimal but genuinely useful shape looks like this: a Telegram Trigger node listening for messages, feeding into a Switch node that reads the incoming text and routes on simple command matches, each branch ending in a Telegram node that sends a reply back into the same chat using the trigger's `chat.id`. That's a working command-driven bot in three node types, and it scales fine well past a handful of commands since Switch handles as many branches as you throw at it.

Media has real limits worth knowing before a workflow fails on something that looked fine in testing. Animations are capped at 50 MB and have to be GIFs or silent H.264/MPEG-4 video. Stickers need to be .WEBP, animated .TGS, or video .WEBM. None of that is n8n-specific, it's the Telegram Bot API itself, but n8n won't stop you from trying to send something outside those bounds, it just fails at send time.

Callback queries, the events fired when someone taps an inline keyboard button, are handled as their own resource on the Telegram node, separate from ordinary message sending. If a workflow needs to answer one (clearing the little loading spinner Telegram shows on the button until you do), that's a distinct operation, not something that happens automatically just because you replied with a message.

## Where this series goes next

Telegram gets a proper trigger node because Telegram was built with bots as a first-class concept from the start. WhatsApp wasn't, and that's exactly why the next post is worth reading even if you don't touch Telegram again: a real, sanitized walkthrough of a WhatsApp automation running on the Evolution API, and what changes when the platform underneath you was never designed for this.
