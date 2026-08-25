---
title: "Self-Hosting n8n in Production: Queue Mode, Workers, and Scaling with Docker Compose"
description: "What actually changes when you move n8n from a single container to queue mode: the Redis-backed architecture, the environment variables that wire it together, and where the free tier stops."
date: 2026-08-16 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, self-hosting, queue-mode, docker-compose, scaling]
series: n8n-tutorials
series_order: 15
---

A single n8n container running on a small VPS will carry you further than you'd expect. It handles triggers, runs executions, and serves the editor UI, all from one process, and for a lot of self-hosted setups that's genuinely enough forever. The moment it stops being enough is usually obvious: executions start queueing up behind each other, a slow workflow blocks a fast one that has nothing to do with it, and the editor UI gets sluggish because the same process trying to run your workflows is also trying to render your canvas. That's the point where queue mode stops being a nice-to-have and starts being the fix.

## What actually changes in queue mode

In the default setup, one n8n process does everything: it receives webhooks, fires scheduled triggers, executes the workflow logic, and serves the UI. Queue mode splits that single process into two roles. A main instance still handles triggers, webhooks, and the UI, but instead of running the workflow itself, it drops the execution onto a queue. Separate worker processes, which can be one or several, pick executions up off that queue and actually run them.

Redis is what sits in the middle holding that queue. It's not optional in queue mode. The main instance and every worker connect to the same Redis instance, and Redis is what lets a worker know an execution is waiting without the main instance having to track which worker is free.

The practical effect is that a workflow that takes ten minutes to process a big CSV file no longer holds up a workflow that fires the instant a webhook lands. They run on different workers, in parallel, instead of competing for the same event loop.

There's a third optional role worth knowing about: dedicated webhook processors. If incoming webhook traffic itself becomes the bottleneck, rather than execution throughput, you can run separate processes whose only job is receiving webhook calls and handing them off, so the main instance isn't also fielding every inbound HTTP request on top of its other work. Most self-hosted setups won't need this split. It's there for when webhook volume specifically, not execution volume, is what's straining the system.

## What you need before you turn it on

Queue mode has two hard requirements that catch people who've been running a comfortable single-container setup. First, it needs PostgreSQL as the database. SQLite, which is what a default n8n install uses out of the box, isn't supported once you're running multiple processes against the same data. Second, if your workflows handle binary data like files or images, filesystem storage stops being a safe option, since a file written to disk on one worker isn't visible to a different worker or to the main instance. You want S3-compatible storage instead.

Neither of these is difficult to set up from scratch. They're just easy to miss if you're migrating an existing instance that's been happily running on SQLite for months.

## The environment variables that wire it together

Enabling queue mode itself is one setting, `EXECUTIONS_MODE=queue`, set on both the main instance and every worker. Everything else is Redis connection info: `QUEUE_BULL_REDIS_HOST` and `QUEUE_BULL_REDIS_PORT` at minimum, with `QUEUE_BULL_REDIS_PASSWORD` if your Redis instance requires auth. All of it has to point at the exact same Redis instance from every process, main and workers alike.

One detail worth calling out because it's an easy way to get a confusing failure: `N8N_ENCRYPTION_KEY` has to match across the main instance and every worker too. Workers need to decrypt the same credentials the main instance encrypted, and if the keys don't line up, executions fail in a way that doesn't obviously point back to a mismatched key.

## Docker Compose shape

A queue-mode Docker Compose file ends up with more services than the single-container version, but the shape is predictable: one Postgres service, one Redis service, one main n8n service, and one or more worker services running the same n8n image with a different start command (`n8n worker` instead of the default). Each worker takes a `--concurrency` flag that caps how many executions it runs in parallel at once, defaulting to 10. If you're watching "waiting for execution" show up in your logs while the server still has CPU and memory to spare, that's your signal to add another worker rather than raise concurrency indefinitely on the one you've got.

Scaling from there is close to mechanical. Need more throughput? Add another worker service to the compose file with the same environment variables pointed at the same Redis and Postgres. Each one is stateless with respect to the others; they're all just competing for jobs off the same queue.

## Where the free tier stops

Everything above, one main instance plus as many workers as you want, is available on n8n's Community edition. Where it stops is high availability on the main instance itself. Running more than one main process for failover, so a crashed main doesn't take webhooks and triggers down with it, is a self-hosted Enterprise feature that needs a license. For most self-hosted setups this doesn't matter day to day. A single main instance with several workers behind it already solves the actual bottleneck, which is execution throughput, not main-instance uptime. It's worth knowing the ceiling exists before you plan around a multi-main setup you can't actually turn on.

## Where this series goes next

Scaling infrastructure only matters once you're actually running something worth scaling, and the next post builds exactly that: an AI Agent workflow inside n8n, using the AI Agent node and connected tools to let a workflow make decisions instead of just following a fixed path.
