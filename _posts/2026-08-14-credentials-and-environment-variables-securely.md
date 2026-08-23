---
title: "Using Credentials and Environment Variables Securely in n8n"
description: "What n8n actually encrypts, what it doesn't, and how to pick between credentials, environment variables, the Variables feature, and External Secrets."
date: 2026-08-14 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, credentials, environment-variables, security]
series: n8n-tutorials
series_order: 13
---

The fastest way to get a workflow working is to paste an API key straight into a Set node and move on. It also happens to be the fastest way to leak that key, because now it's sitting in plain text in your workflow JSON, your execution history, and possibly a git repo if you ever export the workflow to version it. n8n gives you better options than this, and none of them cost you much time once you know which one to reach for.

## What credentials actually protect

When you save an API key or OAuth token into n8n's Credentials system rather than typing it into a node's parameters, n8n encrypts it before writing it to the database. The encryption key that makes this work, `N8N_ENCRYPTION_KEY`, gets generated automatically the first time n8n starts and saved into the `.n8n` folder if you don't set one yourself. You can override it with your own value, but only before that first launch creates the settings file. Set it after the fact and n8n keeps using whichever key it already generated.

That key is worth treating with real care. Lose it and every credential you've saved becomes permanently undecryptable, not "hard to recover," but gone, since there's nothing to reverse the encryption with. If you're running n8n in queue mode with separate workers, every worker needs that same key or it won't be able to read credentials the main instance encrypted. Back the key up somewhere outside your database backup, and definitely outside version control.

Credentials also give you something environment variables can't: they're the only place n8n's External Secrets feature can inject a value into. More on that below.

There's a sharing model built on top of this too, on paid plans. You can share a credential you own with another user or with everyone in a project, and the person you share it with can use it in their own workflows without ever seeing the underlying key or token. Only the person who created the credential, or an instance owner or admin, can view or edit the actual secret value. That's a meaningfully different guarantee than "everyone with editor access can see everything," and it's the reason credentials are the right home for anything sensitive even on a team instance, not just a solo one.

## Where environment variables actually belong

Environment variables are for configuring the n8n instance itself, not for storing the secrets your workflows use. Database connection strings, the encryption key, port numbers, feature toggles, that's the intended use. They live outside n8n entirely, set at the container or process level, which is exactly why they're a reasonable place for genuinely sensitive instance-level values like the encryption key.

Where it gets murkier is `$env`. Workflows can read environment variables through an expression like `{{ $env.SOME_VAR }}` or inside a Code node, and whether that's allowed at all is controlled by `N8N_BLOCK_ENV_ACCESS_IN_NODE`. Leave it at its default and any workflow editor can read any environment variable your n8n process has access to, through any workflow they can edit. On a single-person instance that's a non-issue. On a shared instance, it means an environment variable is only as private as your least trusted collaborator's workflow-editing permissions. If that's not the access model you want, set that variable to block it, and put anything sensitive into a proper credential instead, where n8n's built-in credential permissions actually apply.

## Variables: not the same thing as environment variables

n8n also has a separate feature, confusingly also called Variables, that's unrelated to your host's environment variables. These are key-value pairs you set once through the Settings UI and reference in expressions as `$vars.yourKey`. They're read-only from inside a workflow, string-only, and capped at fairly small key and value lengths, which tells you what they're for: shared, non-secret configuration like a default region code or a feature flag, not authentication tokens. On self-hosted instances this feature sits behind a paid license tier, so if you're running the free Community edition, this one isn't available to you and environment variables plus credentials are what you've got.

## External Secrets, if you're on a plan that has it

For teams already running a secrets manager like AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, or a couple of others n8n supports, External Secrets lets n8n pull a value from that vault at execution time instead of storing it in n8n's own database at all. You reference it as `{{ $secrets.vaultName.secretName }}`, but only inside credential fields specifically, not in arbitrary expressions elsewhere in a workflow. This is also gated to Enterprise plans, and it's genuinely worth it once you're managing credentials across more than one n8n environment and rotating a key means updating it in exactly one place instead of chasing it down in every instance that uses it.

## A practical way to decide

If a value authenticates you to something, real or synthetic, it goes in a credential. If it configures the n8n instance itself, it's an environment variable, and if a workflow needs to read it, decide deliberately whether `$env` access should be open or blocked rather than leaving the default in place without thinking about it. If it's shared, non-secret, and needs to be edited without touching code or redeploying anything, that's what Variables is for, license tier permitting. And if you're already paying for a secrets manager and don't want n8n's database to be another place a credential lives, External Secrets closes that gap.

None of these require much extra setup once you've built the habit. The habit itself, checking which bucket a value belongs in before you paste it anywhere, is the part that actually prevents the leak.

## Where this series goes next

Next up, we'll look at sub-workflows and the Execute Workflow node, and how breaking one sprawling automation into smaller, callable pieces makes the whole thing easier to test, reuse, and reason about, credentials included.
