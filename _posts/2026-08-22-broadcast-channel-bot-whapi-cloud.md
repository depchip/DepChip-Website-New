---
title: "Building a Broadcast Channel Bot with Whapi Cloud"
description: "Whapi Cloud trades Evolution API's self-managed WhatsApp Web session for a hosted one, and adds a real broadcast primitive in WhatsApp Channels. Here's how the integration paths differ and how to build a channel bot that respects what channels can actually carry."
date: 2026-08-22 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, whatsapp, whapi-cloud]
series: n8n-tutorials
series_order: 21
---

Evolution API asks you to run your own WhatsApp Web session: your server, your Docker container, your problem when the connection drops. Whapi Cloud takes the same underlying idea, a WhatsApp number linked as if it were a browser tab, and runs that infrastructure for you. You still scan a QR code to connect a number through WhatsApp's Linked Devices feature, so it's not the official Business API any more than Evolution API is. What changes is who's on the hook for keeping the session alive, and that tradeoff is worth understanding before you pick either one.

## What you're actually paying for

Whapi Cloud is a hosted, commercial service, not something you install. There's a free sandbox tier for testing, capped tightly enough that it's only good for confirming your workflow logic works, and a paid tier priced per connected WhatsApp number once you're sending real volume. That's the core exchange: Evolution API costs you server time and the operational burden of babysitting a session; Whapi Cloud costs you a recurring bill and hands the babysitting to someone else.

It doesn't remove the underlying risk profile, though. Because it's still an unofficial connection to WhatsApp rather than an approved Business API integration, a number can still get flagged for aggressive sending, and a protocol change on WhatsApp's side can still break things until Whapi patches around it. You're outsourcing the maintenance, not the risk.

## Two ways into n8n, and one is more flexible here than with Evolution API

Whapi Cloud's own integration docs walk through the same two paths Evolution API offers: a dedicated community node, `n8n-nodes-whapi`, or plain HTTP Request calls against their API gateway.

The community node covers sending messages, checking message status, verifying phone numbers, and reading events for messages and groups, all wrapped in proper n8n fields. Like any community node, it only installs on self-hosted n8n, and only an Owner or Admin account can add it after explicitly acknowledging you're installing unverified third-party code.

The HTTP Request path authenticates with a Bearer token, the channel token from your Whapi dashboard, set as n8n's built-in Bearer Auth credential type so the token never sits in plaintext inside a node. Requests go to `https://gate.whapi.cloud/`, with `POST /messages/text` handling the actual send. One real difference from Evolution API here: because Whapi Cloud is a hosted API rather than something you're self-hosting, the HTTP Request path works from n8n Cloud too, not just a self-hosted instance. If you don't want to run n8n yourself at all, this is the path that keeps that option open.

## Channels are the part Evolution API doesn't really have

This is the reason Whapi Cloud is worth a separate post rather than a footnote on the last one. WhatsApp Channels, what the API itself calls newsletters, are a real broadcast primitive: an admin posts, followers receive, and there's no reply path back into the channel itself. That one-way shape is exactly what a broadcast bot needs, and it's structurally different from a group chat or a 1:1 conversation, where n8n has to filter out replies and noise it doesn't care about.

Sending to a channel uses the same `messages/text` endpoint as sending to a person, with the destination distinguishing the two. A channel ID looks like `120363171744447809@newsletter` rather than a phone number, and you get it once with `GET /newsletters?count=100` against your own account, then just reuse it, since it doesn't change.

Channels don't carry everything a regular chat can, though. The supported content is text, images, videos, stickers, links, voice notes, and polls, not the full range WhatsApp otherwise supports. If your bot's job includes pushing out a PDF report or a document attachment, a channel post is the wrong destination for that piece of it.

## Wiring up the actual bot

The shape ends up simpler than the Evolution API webhook-driven bots from last time, because a broadcast bot doesn't need to listen for anything on the WhatsApp side at all. It only needs to notice new content somewhere else and push it out.

A Schedule Trigger runs on whatever cadence makes sense for the content, hourly for something like news or listings, daily for something slower-moving. From there, an HTTP Request node (or whatever node fits the source, an RSS read, a database query, a call to some other API) pulls the latest items. A Filter or IF node checks each item against whatever you're using to track what's already gone out, a simple Google Sheets row or a Postgres table keyed on item ID works fine at this scale, so the bot doesn't repost the same update every time it runs. Whatever survives that filter gets formatted into the message body and sent via HTTP Request to `messages/text`, with `to` set to your channel ID.

That's the whole workflow: five nodes, no webhook, no state beyond "what have I already posted." The complexity that used to live in filtering incoming webhook events, the bulk of what made the Evolution API bots more involved, just isn't there, because a channel bot only talks in one direction.

## What actually trips people up

The failure mode we've seen most is posting content the channel format doesn't support and getting a rejected request back, usually because someone assumed "send anything you'd send to a person" applies to channels too. It doesn't, and the fix is checking your content type against the channel's supported list before the HTTP Request node fires, not after it fails.

The other one is dedup logic that's too loose. If the item-tracking check is keyed on something unstable, a title that gets edited slightly, say, rather than a real unique ID, you'll get duplicate posts to a channel your followers can't mute individual messages from the way they can a chat. Channels are unforgiving of noise in exactly the way they're built to avoid it, so it's worth being stricter about what counts as "new" than you might be for an internal Slack notification.

## Where this series goes next

WhatsApp and the chat platforms before it all live in tools your team already has open. Next we're moving somewhere most people don't expect n8n to reach: Microsoft Teams, and what changes when the platform you're automating around is built for a very different kind of organization than the ones running Slack or Discord.
