---
title: "WhatsApp Automation with the Evolution API: A Working Case Study"
description: "How n8n talks to WhatsApp without the official Business API: the Evolution API architecture, the two integration paths into a workflow, and what actually breaks once real messages are flowing."
date: 2026-08-21 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, whatsapp, evolution-api]
series: n8n-tutorials
series_order: 20
---

WhatsApp comes up in more automation requests than any other channel we build for, and almost none of those requests go through Meta's official WhatsApp Business API. The official API is built for larger, verified businesses, it involves an approval process, and it isn't a great fit for the kind of small internal bot or notification channel most of our clients actually want. That's the gap the Evolution API fills, and it's the backbone behind more than one workflow we run ourselves.

## What Evolution API actually is

Evolution API is an open source, self-hosted REST API that sits in front of WhatsApp Web. Under the hood it uses Baileys, a library that speaks the same protocol your phone's WhatsApp Web session does, so from WhatsApp's point of view your automation looks like a logged-in browser tab rather than an approved business integration. You run it as its own service (a Docker container is the usual route), scan a QR code once to connect a number, and from then on it exposes endpoints for sending messages, managing that connection, and pushing events out to a webhook.

That architecture is also the honest tradeoff worth naming up front: because it isn't sanctioned by Meta the way the official Cloud API is, there's a real risk of a number getting flagged or banned if you send aggressively or the underlying protocol shifts underneath you. The Evolution API community tends to patch protocol breakage fast, but it's still not the tool we'd reach for if a client needed guaranteed uptime on a customer-facing support line. For internal notifications, digests, and small reply-driven bots, the tradeoff has been worth it for us.

## Two ways to wire it into n8n

Once Evolution API is running somewhere, there are two real paths to connect it to a workflow.

The first is a community node, `n8n-nodes-evolution-api`, which wraps the REST endpoints in proper n8n fields for sending messages, managing instances, and handling groups. Community nodes only install on self-hosted n8n, and only an Owner or Admin account can add one, since n8n makes you explicitly accept that you're installing unverified code from a public source before it'll let the install go through.

The second path, and the one we lean on more, is a plain HTTP Request node. Evolution API authenticates with a simple `apikey` header, which maps cleanly onto n8n's generic Header Auth credential: store the key once as a credential, point the HTTP Request node's URL at your instance's send-message endpoint, and pass Header Auth instead of pasting the key into the node directly. This skips the "unverified code" tradeoff entirely, and it means the moment Evolution API adds a new endpoint, you don't have to wait on a maintainer to expose it through a node. Given a choice, we default to the HTTP Request approach and only reach for the community node when a workflow leans heavily on operations, like WhatsApp group management, that would otherwise mean building several near-identical HTTP Request nodes by hand.

## The shape of a typical workflow

Most of the WhatsApp automations we build follow the same three-part structure, just with different logic in the middle.

Inbound messages arrive as a webhook. You configure Evolution API to POST every event, message received, message sent, connection status change, to a Webhook node's URL, and n8n starts receiving JSON payloads the instant something happens on that number. That payload carries an event type field, so the first real node in the workflow is almost always a Switch or IF node that filters down to just the event you care about (usually `messages.upsert` for an incoming text) and drops the rest.

From there it's ordinary n8n: a Set node to pull the sender's number and message text out of the nested payload, whatever logic decides what to do with it, and then an outbound HTTP Request node back to Evolution API's send endpoint to reply. If the workflow needs to remember anything between messages, a lightweight store like Google Sheets or a Postgres table works fine for low-volume bots; you don't need anything heavier until you're running real conversational state at scale.

## What actually goes wrong

The most common failure mode isn't a code bug, it's the WhatsApp Web session itself dropping. Because Evolution API is impersonating a logged-in browser rather than holding an approved API connection, a phone going offline for too long, a forced logout from the WhatsApp app, or just protocol drift can knock the session out, and the fix is manually rescanning a QR code rather than anything a workflow retry can paper over. We treat "is the instance still connected" as its own health check, not something we find out about only when a message silently fails to send.

The second thing that trips people up is payload shape. Evolution API's webhook fires for every event on the instance, not just messages you care about, and the JSON nesting differs meaningfully between event types. Skipping the filtering step and trying to read `message.text` directly off the raw payload is the fastest way to get a workflow that works in testing and then throws expression errors the first time a delivery-receipt event comes through instead of a text message.

The third is rate limiting on your own side. Nothing stops you from firing outbound messages as fast as your workflow can loop, but sending too many too quickly to too many different numbers is exactly the pattern that gets a number flagged. If a workflow is doing anything close to a broadcast, a short delay between sends is cheap insurance against losing the number entirely.

## Where this series goes next

Evolution API isn't the only self-hosted option out there. Next time we're looking at Whapi Cloud, a different WhatsApp automation service with its own tradeoffs, and walking through building a broadcast-style bot on top of it so you can see where the two approaches actually diverge in practice.
