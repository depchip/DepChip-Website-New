---
title: "Data Transformation with the Set, Function, and Code Nodes"
description: "How to reshape data inside n8n once it's already in your workflow, and why the Set node and Code node are the two you'll actually reach for."
date: 2026-08-07 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, data-transformation, code-node, javascript]
series: n8n-tutorials
series_order: 7
---

A trigger hands you data in whatever shape the sending system decided to use, not the shape your next node needs. A webhook from one form builder nests everything under `submission.fields`. Another sends flat top-level keys. A database query returns column names with underscores when the API you're posting to expects camelCase. None of this is a problem n8n causes, it's just what happens when two systems that were never designed to talk to each other end up in the same workflow. The Set and Code nodes are how you close that gap.

## The Set node: adding and cleaning up fields

The Set node (labeled "Edit Fields" in the node picker) is the one you'll use most, because most transformation isn't really logic, it's just renaming, reformatting, or trimming down what gets passed forward.

It has two modes. Manual Mapping is a list of name/value pairs, where each value can be a fixed string or an expression pulling from `$json`. This is the one to reach for when you know exactly which two or three fields you're touching, like adding a `receivedAt` timestamp or renaming `full_name` to `name`.

JSON mode replaces that list with a single JSON object you write by hand, expressions and all. It's a better fit once you're setting more than four or five fields, or when the output shape itself is nested and awkward to build field-by-field through the UI.

Two options change what actually reaches the next node. "Include Other Input Fields" decides whether fields you didn't explicitly set still pass through, off by default, so a bare Set node only outputs what you told it to. And dot notation in field names is hierarchical by default: naming a field `address.city` produces `{ "address": { "city": ... } }` rather than a literal key with a dot in it. That default trips people up the first time they need a field name that legitimately contains a period, which is what the "disable dot notation" option under Options is for.

## Function and Function Item: still around, but not where you should start

If you've read older n8n tutorials or opened a workflow built a few years ago, you may run into the Function and Function Item nodes. Function ran your code once against the whole item list; Function Item ran it once per item. Both are still technically usable, but n8n replaced them with the Code node back in version 0.198.0, and new workflows should use Code instead. If you inherit a workflow with a Function node in it, it'll keep working, there's no urgency to rip it out, but there's no reason to add a new one.

## The Code node: JavaScript or Python when Set isn't enough

Once you need a loop, a conditional, or anything that isn't a straight field mapping, the Code node is where that logic lives. You can write JavaScript or Python, and the node gives you a choice up front that matters more than it looks: **Run Once for All Items** or **Run Once for Each Item**.

Run Once for All Items is the default. Your code executes a single time, and you're responsible for looping over everything yourself, usually via `$input.all()`, which returns the full array of incoming items. This is the mode you want when the transformation depends on more than one item at a time, deduplicating a list, or building a summary count.

Run Once for Each Item runs your code separately for every incoming item, and inside it you work with `$json` or `$input.item()` for just that one item's data. It reads simpler for straightforward per-item transforms, but it's the wrong choice the moment your logic needs to compare items against each other.

Whichever mode you pick, the output has to come back as an array of objects, each with a `json` key holding the actual data:

```javascript
// Run Once for All Items
const items = $input.all();
return items.map(item => ({
  json: {
    ...item.json,
    fullName: `${item.json.firstName} ${item.json.lastName}`,
  },
}));
```

Two limits are worth knowing before you lean on this node too heavily: it can't make HTTP requests or touch the filesystem (that's what the HTTP Request node and file-handling nodes are for), and on n8n Cloud, importable packages are restricted to the crypto module and moment for JavaScript, with no external library imports at all for Python. Self-hosted instances are more permissive, npm packages are importable, and Python gets whatever's allowlisted in the task runner image, but it's not unlimited there either.

## Picking between them

The honest rule we use: reach for Set first. If what you need is naming, reshaping, or a couple of computed fields, it'll almost always cover it with less to maintain later, since anyone opening the workflow can read a Set node's mapping at a glance without reading code. Drop into Code only when the transformation genuinely needs a loop, a conditional branch, or logic that touches more than the current item, deduplicating a list, computing a running total, or parsing a string format Set's expressions can't handle cleanly.

## Where this series goes next

Reshaping data is only useful once you can also branch on it. Next we'll get into the IF, Switch, and Merge nodes, and how to route a workflow down different paths depending on what the data actually says.
