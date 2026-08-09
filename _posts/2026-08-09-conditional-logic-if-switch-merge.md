---
title: "Conditional Logic: IF, Switch, and Merge Nodes Explained"
description: "How to make an n8n workflow branch based on the data it receives, using the IF and Switch nodes, and how to bring those branches back together with Merge."
date: 2026-08-09 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, conditional-logic, if-node, switch-node]
series: n8n-tutorials
series_order: 8
---

A workflow that only ever moves data in one direction isn't really automating a decision, it's just automating a single path. The moment you need different handling for different data, a failed API call versus a successful one, a large order versus a small one, a form submission missing a required field, you need something that can ask a question and act differently depending on the answer. n8n gives you two nodes built for exactly that: IF and Switch. And once a workflow forks into separate branches, you'll usually need the Merge node to bring them back together downstream.

## Splitting a workflow with IF

The IF node asks a single question and sends every item down one of two outputs: true or false. Nothing more complicated than that, which is exactly why it's the node to reach for first.

You build the question by adding one or more **Conditions**. Each condition picks a data type, string, number, date and time, boolean, array, or object, and a comparison to run against it. Strings get things like equality, contains, and regex matching. Numbers and dates get the relational comparisons you'd expect: greater than, before, after. Arrays let you check length or containment, and objects are limited to existence and emptiness checks, since "is this object greater than that one" isn't a meaningful question.

Add more than one condition and you choose how they combine. Select **AND** and an item has to satisfy every condition to go down the true branch. Select **OR** and satisfying any one of them is enough. This is the whole node: one true output, one false output, as many conditions feeding into that single decision as you need.

## When two branches aren't enough: Switch

IF gets you two paths. The Switch node gets you as many as the situation calls for, and it comes with two different ways to define them.

**Rules mode** is the more common of the two and works a lot like stacking several IF conditions side by side, except each one gets its own dedicated output instead of collapsing into true or false. You define a routing rule per output, using the same data type and comparison options IF uses, and optionally give each output a readable name instead of a bare index number.

**Expression mode** hands you direct control instead: you set a number of outputs and write an expression that returns which output index a given item should go to. It's the right call when the routing logic is genuinely dynamic, computed from the data itself, rather than a fixed set of comparisons you can lay out as rules.

Rules mode also has a setting worth knowing about before it surprises you: **Fallback Output**, which decides what happens to an item that doesn't match any rule. The default, None, just drops it, which is an easy way to lose data silently if you're not paying attention. Extra Output sends unmatched items somewhere you can still see them, and Output 0 folds them into the same output as your first rule. If you're routing anything you can't afford to lose, don't leave this on the default without thinking about it first.

## Getting branches back together with Merge

Splitting a workflow is only half the job. Most of the time you eventually want those branches to converge again, whether that's combining enriched data from two lookups or just funneling multiple paths into one shared logging step. That's what the Merge node is for, and it has more going on under the hood than its name suggests.

**Append** is the simplest mode: it just stacks the items from each input one after another, in order, without trying to relate them to each other at all. Reach for this when the branches produced unrelated items that just need to end up in the same list.

**Combine** is where most real merging happens, and it has three sub-modes. Combining by **Matching Fields** compares items across inputs by the values in fields you specify, essentially a join, and you get to choose whether you want only the matches, only the non-matches, or everything with matches enriched (Keep Everything, or the one-sided Enrich Input 1/2 variants). Combining by **Position** pairs up the first item of Input 1 with the first item of Input 2, and so on down the list, useful when two branches process the same original items in the same order and you just need to recombine their results. Combining by **All Possible Combinations** does exactly what it sounds like, producing every pairing between the two inputs, which is a lot less common but occasionally exactly what you need.

There's also a **SQL Query** mode, letting you write an actual `SELECT` statement against your inputs as if they were tables named `input1`, `input2`, and so on, and a **Choose Branch** mode that just picks one input's data to pass through untouched, useful for a workflow that branches for decision-making purposes but only ever needs one side's output to continue.

One behavior worth knowing before it trips you up: if your inputs have different numbers of items, Input 1 takes precedence. Five items in Input 1 and ten in Input 2 means the Merge node processes five pairs and quietly drops the other five from Input 2 unless you've explicitly enabled the option to keep unpaired items.

## A pattern we use constantly

A shape that comes up in a lot of the workflows we build: an IF node checks something about an incoming order or request, maybe whether it's over a dollar threshold, and routes big ones to a branch that pings a person for manual review while everything else auto-approves down the other branch. Both branches eventually do the same final thing, write a record to a sheet or database, so they get wired back together into a single Merge node in Append mode before that write happens. One logging step instead of two duplicated ones, and the workflow stays readable at a glance instead of turning into two entirely separate paths that happen to live in the same canvas.

If you're working with an older, pre-1.0 n8n instance, there's a specific gotcha worth knowing here too: in legacy IF node behavior, wiring a Merge node onto both outputs could cause both branches to execute even when only one should have, because the Merge node would retroactively trigger the other side. That behavior was removed as of version 1.0, so on a current instance IF and Merge just work the way you'd expect, but it's the kind of thing worth knowing if you ever inherit an old workflow that seems to be running logic it shouldn't.

## Where this series goes next

Branching logic assumes everything upstream of it worked. Next we'll deal with what happens when it doesn't: error handling and retries, and how to build workflows that fail loudly instead of failing silently.
