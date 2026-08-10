---
title: "Error Handling and Retries: Building Workflows That Don't Silently Fail"
description: "How n8n's per-node error settings, retry logic, and error workflows fit together, and the specific combination of settings that will quietly bite you if you don't know about it."
date: 2026-08-10 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, error-handling, retries, reliability]
series: n8n-tutorials
series_order: 9
---

A workflow that fails is annoying. A workflow that fails and nobody finds out is a real problem, because by the time someone notices, it's usually because a customer noticed first. n8n gives you two separate layers for dealing with this: settings on the individual node that failed, and a workflow-level error workflow that reacts after the fact. They solve different problems, and mixing them up is how you end up with a workflow that looks resilient but isn't.

## What happens on a node, by default

Every node has an **On Error** setting, and the default is **Stop Workflow**. The moment that node throws, the execution halts right there. Nothing downstream runs, and the execution shows up in your history as failed. For most nodes doing something load-bearing, that's the right default. You want to know immediately, not three nodes later when something is working with data that never arrived.

**Continue** is the other end of the spectrum: the workflow keeps going as though nothing happened, using whatever data was there before the failure. This is worth being cautious with. It's the option most likely to produce the exact silent failure this post is about, because downstream nodes have no way to tell the difference between "this ran fine" and "this quietly skipped a step."

**Continue Using Error Output** is the middle ground, and usually the one you actually want when a node can fail in an expected way. Instead of halting or pretending nothing happened, the node routes failed items to a second output you can wire up separately, so you can log them, retry them differently, or route them to a human without taking down the rest of the run.

## Retry On Fail, and a gotcha worth knowing before you rely on it

Below the On Error setting, most nodes also expose **Retry On Fail**, with two fields: how many times to retry, and how long to wait between attempts. Both are capped, not unlimited. Max tries tops out at 5, and the wait between tries is capped at 5000 milliseconds, a limit n8n has kept in place specifically so a retrying node can't sit there indefinitely hogging a worker thread. If you need longer backoff than that, the actual pattern is a separate Wait node in a loop, not this setting.

Here's the part worth knowing before it surprises you: Retry On Fail and On Error don't combine cleanly. If you set On Error to Continue or Continue Using Error Output and also enable retries, a node can succeed on, say, the third attempt and n8n will still mark that execution as an error, exhausting all configured retries regardless of whether an earlier one actually worked. This was reported to the n8n team and closed as not planned, so it isn't a bug waiting to be fixed, it's how the two settings currently interact. If you're relying on retries, the safest combination is still Stop Workflow as your On Error setting, letting the retry mechanism do its job before anything downstream has to react.

## Reacting after the fact: error workflows

Per-node settings decide what happens in the moment. An **error workflow** decides what happens afterward, and it's a completely separate workflow you build once and point other workflows at from their Workflow Settings.

An error workflow always starts with the **Error Trigger** node, and it doesn't need to be active itself, since it only runs when something else fails and calls it. One detail that trips people up: if a workflow contains an Error Trigger node but you haven't explicitly set a different error workflow in its settings, n8n defaults to using that workflow as its own error workflow. Worth checking deliberately rather than assuming.

What actually lands in the Error Trigger depends on where the failure happened. For a normal node failure, you get an `execution` object with the failing node's name, the error message and stack trace, and (if the execution was saved) an `id` and a direct `url` back to it, plus a `workflow` object with the id and name of whatever failed. If the execution was itself a retry, you also get `retryOf` pointing at the original. If the failure happened in the workflow's own trigger node rather than partway through, the shape changes: you get a `trigger` object with the activation error instead, and much less execution detail, since the workflow never actually got far enough to run.

## Forcing an error on purpose

Sometimes you want a workflow to fail, not because something broke, but because the data coming through doesn't meet some condition you care about. That's what the **Stop And Error** node is for. It has two modes: Error Message, where you just write the text you want to appear, and Error Object, where you supply a JSON object with whatever error properties you want to pass through. Either way, it throws a real error, which means it respects the same On Error settings as any other node and can trigger the same error workflow downstream. It's the node we reach for most often to turn a validation check ("this webhook payload is missing a required field") into an actual, visible failure instead of a workflow that quietly does the wrong thing with incomplete data.

## The setup we default to

For most client instances we build, there's one shared error workflow sitting behind everything else: an Error Trigger feeding a node that posts the failure straight into an internal Slack channel, with the workflow name and a link back to the execution. Every production workflow points at it. It's not fancy, and it doesn't need to be. The value isn't in the sophistication, it's in the fact that a failure at 2am shows up somewhere a person will actually see it, instead of sitting in the executions list waiting for someone to go looking.

## Where this series goes next

Handling failure well matters most once a workflow is actually doing something with real data, and one of the most common things people automate early on is reporting. Next we'll connect n8n to Google Sheets and build an automated reporting pipeline, the kind of workflow where a silent failure is especially easy to miss until someone asks why last week's numbers are missing.
