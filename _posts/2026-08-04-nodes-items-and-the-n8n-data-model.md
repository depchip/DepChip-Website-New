---
title: "Understanding Nodes, Items, and the n8n Data Model (JSON In, JSON Out)"
description: "What n8n actually passes between nodes, why every value shows up wrapped in a json key, and how to reference data from any node in the workflow instead of just the one right before it."
date: 2026-08-04 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, data-model, expressions]
series: n8n-tutorials
series_order: 4
---

Last time, you built a workflow that reacted to a webhook and posted the result into Slack. It worked, but we glossed over something: why did the name you sent show up as `$json.body.name` instead of just `$json.name`? Getting that answer straight now will save you real time later, because almost every expression error you'll hit in n8n comes down to a wrong assumption about what's actually sitting in `$json` at that point in the workflow.

## Everything is an array of items

Every node in n8n, whatever it does, passes data to the next node as an array. Each entry in that array is called an item, and each item looks like this:

```json
{
  "json": { "name": "Sample Person", "email": "sample@example.com" },
  "pairedItem": { "item": 0 }
}
```

The `json` key holds the actual data you care about. If a node is handling a file, you'll also see a `binary` key alongside it, holding the file's data, MIME type, and filename separately from the JSON. The `pairedItem` key is easy to ignore at first and we'll come back to it, since it's the thing that quietly breaks workflows once they get more than a couple of nodes long.

That wrapping is the answer to the webhook question. n8n didn't strip a layer off your payload and rename it "body" for style. The Webhook node's output item looks like `{ "json": { "headers": {...}, "body": { "name": "...", "email": "..." }, "query": {...} } }`, because a webhook request carries more than just the body you sent, headers and query parameters travel with it too, and n8n keeps them all visible rather than silently discarding what it assumes you don't need.

## A node runs once per item, automatically

Here's the part that makes n8n genuinely pleasant to build with once it clicks: you almost never write a loop yourself. If a node receives five items, n8n runs that node's configured operation five times, once per item, and hands the next node an array of five results. A Slack node downstream of a five-item array sends five separate messages without you doing anything differently than you would for one.

This is why the node we used for posting to Slack didn't need any special "repeat for each" setting. It's the default behavior, and it holds for almost every node in n8n. The exceptions are nodes explicitly built to work across items rather than within one, like Merge, which combines two separate item arrays, or Aggregate, which collapses many items down into one.

## Referencing data from other nodes

`$json` always means "the current item, as it looks going into this node." That covers most cases, but sometimes you need data from further back, not the node immediately before this one. For that, n8n gives you `$('Node Name').item.json`, which pulls the linked item from any node earlier in the workflow by name, not just the one directly upstream.

Say your workflow is Webhook, then an HTTP Request node that looks up a customer record, then a Slack node. Inside the Slack node, `$json` refers to the HTTP Request node's output, since that's what's feeding it directly. If you also wanted the original name from the webhook payload, you'd write `$('Webhook').item.json.body.name`. You'll see older tutorials use `$node["Webhook"].json` instead; that syntax still runs in most versions, but `$('Webhook').item.json` is the current form and the one n8n's own expression editor autocompletes toward now.

When you need every item at once instead of just the current one, `$input.all()` gives you the full incoming array, with `$input.first()` and `$input.last()` as shortcuts for the obvious cases.

## Seeing it change the fields yourself

Add an **Edit Fields (Set)** node to a test workflow, feed it any item with a couple of fields, and switch between its two modes. Manual Mapping lets you add or overwrite specific fields through the UI, but by default it strips everything else off the item down to just the fields you defined there. Turn on "Include Other Input Fields" if you want the rest of the item to ride along untouched. JSON mode replaces the whole item body with JSON you write directly, which is faster once you're comfortable with expressions but easy to fat-finger into invalid data if you're rushing.

Toggle "Include Other Input Fields" off and on and watch the item preview panel update. That preview panel, more than anything written here, is what teaches you this model. Get in the habit of clicking on any node after a test run and actually reading what's sitting in its output.

## Where pairedItem bites people

`pairedItem` tracks which input item a given output item came from, and n8n uses it behind the scenes so that error messages and item-linking features can tell you "this came from item 2 of the original webhook." Most built-in nodes maintain it correctly without you thinking about it. The Code node is where it gets real: if you write JavaScript that builds and returns brand-new item objects instead of transforming the ones that came in, you can lose that link, and later nodes that expect to trace an item back to its source will error or behave unpredictably. If you ever see an error mentioning `pairedItem` or "can't find item," this is almost always the actual cause, not a bug in your logic.

## Where this series goes next

You now know what's actually moving between nodes and how to reach back further than just the previous one. Next time we put that to work with the HTTP Request node, calling a real external API, handling whatever shape of JSON it hands back, and dealing with the pagination and auth questions that come up the moment you're not just building toy examples anymore.
