---
title: "Your First Workflow: Trigger a Slack Message from a Webhook"
description: "Build the two-node workflow that teaches you the most about n8n: a Webhook trigger that catches an incoming request and a Slack node that posts it somewhere a human will see it."
date: 2026-08-03 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, webhook, slack, automation]
series: n8n-tutorials
series_order: 3
---

Reading about nodes and triggers only gets you so far. The moment n8n actually clicks is when you build one small workflow yourself and watch a request you sent land inside it a second later. So that's what this post does: one webhook, one Slack message, wired together and tested for real.

## What we're building

A webhook trigger catches an incoming HTTP request. A Slack node takes whatever came in and posts it into a channel. That's the whole workflow, two nodes, and it's the same shape you'll see underneath a huge number of real automations: something happens, and a person finds out about it without having to go check.

## Adding the trigger

Start a new workflow and add a **Webhook** node. Three settings matter right away.

**HTTP Method** decides what kind of request the webhook will accept. GET is the default, but almost everything worth automating sends data along with the request, so you'll usually switch this to POST.

**Path** is the part of the URL unique to this workflow, something like `new-lead`. n8n builds the full webhook URL around it automatically.

**Respond** controls what the caller gets back once the workflow runs. There are three options worth knowing: respond immediately with a generic acknowledgment, wait until the last node in the workflow finishes and return whatever that node produced, or hand control to a separate Respond to Webhook node placed later in the flow. For this workflow, immediately is fine. We're not waiting on anything the caller needs back.

One detail that trips people up the first time: n8n gives you two different URLs for the same webhook, a test one and a production one. The test URL only listens while you've got the workflow open and have clicked "Listen for Test Event." The production URL only starts accepting requests once you activate the workflow, and at that point nothing shows up live in the editor anymore, you'd check the Executions tab instead. Get used to testing on the test URL first. It saves you from wondering why your production endpoint looks dead when it just hasn't been turned on yet.

## Sending it a test request

With the workflow open and "Listen for Test Event" clicked, send it something. A quick curl command works fine:

```bash
curl -X POST https://your-n8n-instance.example.com/webhook-test/new-lead \
  -H "Content-Type: application/json" \
  -d '{"name": "Sample Person", "email": "sample@example.com"}'
```

You'll see the request land in the editor, and the panel below the node will show you the payload sitting under `body`, so you'd reference the name later as `{{$json.body.name}}`. That "body" wrapper is easy to forget the first time you write an expression and can't figure out why it's returning nothing.

## Adding the Slack node

Connect a **Slack** node after the Webhook node. Set the resource to **Message** and the operation to **Send**. You'll need a Slack credential connected first, which means creating a Slack app with permission to post messages, but that's a one-time setup and Slack's own app creation flow walks you through it well enough that it doesn't need repeating here.

Pick the channel from the dropdown, and in the message text field, build a string using the data that came through the webhook:

```
New lead: {{$json.body.name}} ({{$json.body.email}})
```

Save, activate the workflow, and send the same curl request again, this time against the production URL (drop `-test` from the path). Check Slack. If the message shows up with the actual values from your test payload instead of the raw expression text, the data is flowing correctly end to end.

## What we'd flag before you rely on this

A webhook with no authentication in front of it is open to the internet. That's fine for a quick experiment on your own instance, but before this pattern touches anything that matters, you want at least a shared secret checked in an IF node, or ideally proper signature verification if the sender supports it. We'll get into that properly later in this series.

It's also worth building the habit of checking what actually landed in `$json.body` rather than assuming it matches what you sent. Different services wrap their webhook payloads differently, some nest everything under an extra key, some send an array instead of an object, and the fastest way to find out is to look at a real execution rather than guess from documentation.

## Where this series goes next

You've now got a workflow that reacts to something happening outside n8n and does something useful with it, which is most of what automation actually is. Next time we go one level deeper into the data itself: how n8n represents items as JSON, what changes as data moves from node to node, and why understanding that model makes everything after conditional logic and error handling much easier to reason about.
