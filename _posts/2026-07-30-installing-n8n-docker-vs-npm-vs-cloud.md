---
title: "Installing n8n: Docker, npm, and n8n Cloud Compared"
description: "A practical decision table for the three real ways to run n8n, plus the exact commands to get a working local instance in the next five minutes."
date: 2026-07-30 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, docker, self-hosting]
series: n8n-tutorials
series_order: 2
---

A client asked us last week which install method they should use, and the honest answer took longer than expected because it actually depends on what they're trying to do. There isn't a single right answer here, just three reasonable ones for three different situations. So instead of picking one for you, we're going to walk through what each option actually costs you, then get an instance running so the next post in this series has something to work with.

## The three real options

n8n Cloud is the managed version. n8n runs the servers, handles upgrades, and you log in and start building. Self-hosting with Docker means running n8n in a container on a machine you control, whether that's your laptop or a VPS. Self-hosting with npm means installing n8n directly as a Node package and running it as a regular process, no container involved.

There's a fourth option, the desktop app, but we're skipping it here. It's fine for poking around, not something we'd point a client toward for anything that needs to keep running.

## What actually differs between them

**n8n Cloud** costs money from day one; there's a 14-day free trial and then Starter, Pro, and Enterprise tiers on top of it. What you get in exchange is zero setup and zero maintenance. Nobody on your team has to think about backups, updates, or server capacity. If you're validating whether automation is even worth investing in, or you don't have anyone who wants to own a server, this removes a whole category of problems.

**Docker** is what we run for clients and what we run for ourselves. It costs whatever your server costs, which is usually a lot less than a Cloud subscription once you're running real volume. The tradeoff is that you own the uptime. If the container crashes at 3am, that's your problem to notice and fix, not n8n's support team's.

**npm** installs n8n straight onto a machine's Node runtime. It's the fastest way to get something running locally, and it's genuinely useful for trying things out or developing custom nodes. We wouldn't put it in front of production traffic. There's no container boundary between n8n and everything else running on that machine, and the built-in tunnel feature for testing webhooks says outright in n8n's own docs that it isn't safe for production use.

| | n8n Cloud | Docker | npm |
|---|---|---|---|
| Setup time | Minutes, no install | 5-10 minutes | 2-3 minutes |
| Ongoing cost | Subscription | Server cost only | Server cost only |
| Who handles upgrades | n8n | You | You |
| Good for production | Yes | Yes | Not recommended |
| Good for trying things fast | Somewhat (billing gate) | Yes | Best option |

If you're not sure yet, start with Docker. It's the option that scales from "playing around on a laptop" to "running a client's production workflows" without switching approaches halfway through, which is exactly why it's what we default to.

## Getting n8n running with Docker

You'll need Docker Desktop installed, or Docker Engine plus Compose if you're on Linux. Once that's in place, this is the whole thing:

```bash
docker volume create n8n_data

docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="America/New_York" \
  -e TZ="America/New_York" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -e N8N_RUNNERS_ENABLED=true \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Swap the timezone values for your own. The volume mount matters more than it looks: `/home/node/.n8n` is where n8n keeps your encryption key, workflow data, and execution logs, and mounting a named volume there means that data survives a container restart instead of vanishing with it. Skip that step once and you'll only make the mistake one time.

Once the container's up, open `http://localhost:5678` and you'll land on n8n's setup screen. That's a real, working instance, running entirely on your own machine.

For anything you intend to keep running past today, swap SQLite for Postgres by adding a handful of `DB_POSTGRESDB_*` environment variables, and reach for Docker Compose instead of a single `docker run` line so the database and n8n itself are managed together. We'll get into that setup properly when this series covers production self-hosting later on.

## Getting n8n running with npm, if you'd rather

n8n needs Node.js 20.19 through 24.x. If you're not sure what you're running, `node -v` will tell you. To try it without installing anything permanently:

```bash
npx n8n
```

To install it properly:

```bash
npm install n8n -g
n8n start
```

Same result, same URL, `http://localhost:5678`. The difference is what's underneath it: no container, no isolation, and no automatic handling of what happens when a Node minor version upgrade breaks something unrelated to n8n on that same machine.

## Which one we'd tell you to pick

For this series, we're going to assume you're running n8n locally via Docker, because that's the setup you can carry forward into everything else we build. If you'd rather use n8n Cloud so you can skip the server-ownership question entirely, everything else in this series will still apply. The nodes and workflows look identical either way; only the "who's responsible when it breaks" question changes.

If you went with npm to try it out just now, that's fine too. Nothing about the next post depends on which of the three you picked, only that you've got an instance open in a browser tab.

## Where this series goes next

With an instance running, next time we build an actual workflow: a webhook that catches a form submission and posts it straight into Slack, the same three-node shape we described in the last post, except this time you'll click through it yourself instead of reading about it.
