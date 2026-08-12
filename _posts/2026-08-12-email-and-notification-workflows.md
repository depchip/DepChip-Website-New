---
title: "Automating Email and Notification Workflows (Gmail/SMTP + Slack/Discord)"
description: "Choosing between the Gmail node and the generic SMTP node, and between Slack and Discord, for the notification step almost every n8n workflow eventually needs."
date: 2026-08-12 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, gmail, smtp, slack, discord, notifications]
series: n8n-tutorials
series_order: 11
---

At some point almost every workflow you build ends the same way: something needs to tell a person what just happened. An order came in, a job failed, a report is ready. n8n gives you more than one way to send that message, and which one you reach for depends less on personal taste and more on who's supposed to see it and how fast they need to.

## Gmail node vs the generic Send Email node

n8n ships two different ways to send an email, and they solve different problems.

The Gmail node talks to the Gmail API directly, using OAuth2. You pick a Google account, n8n asks for permission once, and after that the node can send, search, label, and manage threads without you ever touching a password. This is the node to use when the email genuinely needs to come from a real Gmail or Google Workspace inbox, especially if you want replies to land back in that inbox as a normal conversation.

The Send Email node is different: it talks SMTP directly, the same protocol nearly every mail provider supports. You give it a host, a port, a username, and a password (or an app-specific password, depending on the provider), and it sends through whatever mailbox those credentials point to. It doesn't care if that mailbox is Gmail, Outlook, a transactional provider, or something your hosting company runs. That portability is the whole appeal: swap providers and you change a credential, not a workflow.

If you're already committed to Google Workspace and want the email to behave like something a human sent from their own account, use Gmail. If you want a notification pipeline that isn't tied to one vendor, or you're sending from a shared address that isn't really anyone's personal inbox, SMTP is the more honest fit.

## Slack vs Discord for team notifications

For internal alerts, chat beats email most of the time. Nobody's checking their inbox every five minutes, but plenty of teams live in Slack or Discord all day.

The Slack node authenticates through a Slack app you create for your workspace, and the specific permission you need to post messages is the `chat:write` scope. Once that's granted, a single Send Message operation with a channel and a text field is enough to get a notification into the right place. Slack's node also covers a lot of ground beyond messaging (channels, files, reactions, user lookups), which is worth knowing about even if today you only need the one operation.

Discord gives you three different ways to connect, and they're not interchangeable. A webhook is the simplest: no bot, no OAuth, just a URL you generate from a channel's integration settings and paste into the node's credential. It can only push messages into that one channel, but for a pure notification use case that's usually all you need. A bot token gets you a real Discord bot that can read channels, manage roles, and react to messages, which matters the moment you want the workflow to do more than announce things. OAuth2 sits on top of the bot approach and mostly exists to make installing that bot easier for other people.

For a one-way "tell the team something happened" notification, a Discord webhook and a Slack bot with `chat:write` are doing the same job with roughly the same amount of setup. Pick based on where your team actually talks, not which integration looks more capable on paper.

## A notification step in practice

Say a scheduled workflow checks an API for failed orders every fifteen minutes. If it finds any, that's the moment to notify, not silently log it somewhere nobody looks.

An IF node checks whether the failed-orders count is above zero. On the true branch, a Set node builds a short summary out of the data, order count, the first few order IDs, nothing more than someone needs to decide whether to act. Then either a Slack node posts that summary to an #alerts channel, or a Discord node does the same over a webhook. The false branch does nothing, which is exactly right. A workflow that pings a channel every fifteen minutes to say nothing happened trains everyone to ignore it.

That's the general shape worth reusing: check a condition, build a short human-readable message from the data you actually have, and send it through whichever channel your team will actually see.

## Watch your rate limits

Every one of these integrations enforces limits, and they matter more than people expect once a workflow scales up. Slack's `chat.postMessage` method will start returning rate-limit errors if you fire messages at a channel too quickly in a tight loop, which is a real trap if you're looping over a list of items and notifying on each one individually instead of batching them into a single message. Gmail's sending limits depend on the type of account, and a personal Gmail account has a noticeably lower daily cap than a Google Workspace account, which matters if a workflow starts sending more volume than it did when you first built it. None of this is a reason to avoid these nodes. It's a reason to batch notifications where you can, and to treat "send one message per item in a loop" as something to double check before it becomes a production habit.

## Where this series goes next

Next up we build a lead-capture-to-CRM pipeline: a web form submission that lands in Airtable or HubSpot instead of an inbox, using a lot of what we've covered so far, webhooks, data transformation, conditional logic, and now notifications, put together into something a real business would actually run.
