---
title: "Working with the HTTP Request Node: Calling Any REST API"
description: "How the HTTP Request node actually works in n8n: methods, authentication, bodies, and the handful of errors that trip up almost everyone the first time."
date: 2026-08-05 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, http-request, rest-api, automation]
series: n8n-tutorials
series_order: 5
---

Sooner or later, almost every workflow we build needs to talk to something that doesn't have a dedicated n8n node. Maybe it's an internal tool, a niche SaaS product, or an API that launched last month and nobody's written an integration for yet. That's what the HTTP Request node is for, and once you understand it properly, it makes the hundreds of pre-built nodes in n8n feel a lot less essential than they first seemed. Most of what those nodes do under the hood is just this node with the details filled in for you.

## What the node actually does

The HTTP Request node sends an HTTP call to a URL you specify and hands you back whatever comes back, formatted as JSON, text, or a file depending on what the response looks like. You pick a method (GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS), give it a URL, and everything else is optional configuration layered on top of that.

If you've never made a raw API call before, GET requests read data and don't change anything on the other end. POST, PUT, and PATCH send data and usually create or update something. DELETE removes something. That's the whole mental model you need to get started.

## Authentication: use predefined credentials when you can

The single most common mistake we see with this node is people reaching straight for manual header configuration when n8n already has a proper credential type for the service they're calling. Under the **Authentication** dropdown, always check **Predefined Credential Type** first. If the service you're hitting is on that list, n8n handles the token exchange, refresh, and header formatting for you, and your credentials live in n8n's encrypted credential store instead of sitting in plain text inside a node's parameters.

When the API isn't on that list, which happens often with smaller or internal tools, you fall back to **Generic Credential Type**. From there you pick the auth style the API actually uses: Basic Auth, Header Auth, Query Auth, Digest Auth, or OAuth1/OAuth2 if you're setting up the token dance yourself. Header Auth is the one you'll reach for most, since a lot of modern APIs just want an `Authorization: Bearer <token>` header and nothing fancier.

## Query parameters, headers, and the body

Turn on **Send Query Parameters** to add filters to the URL, the `?key=value` part you'd normally type by hand. Turn on **Send Headers** for anything the API needs in its request headers beyond auth, things like `Accept: application/json` or a custom API version header some services require. Both let you enter name/value pairs directly or switch to a raw JSON view if you're building the values dynamically from expressions.

The body follows the same "using fields" or "using JSON" split, but you also have to pick a content type first: JSON is what you'll use most, though form-urlencoded and multipart form-data show up when you're dealing with older APIs or file uploads. Get the content type wrong and the API will usually reject the request outright rather than silently misreading it, which is at least a fast failure to debug.

One habit worth building early: when you're constructing the body with an expression instead of typing it directly, wrap the whole thing in double curly braces so n8n evaluates it as an expression rather than treating it as a literal string. Miss that step and you'll send the literal text of your expression to the API instead of the value it was supposed to produce, which is a confusing thing to debug the first time it happens.

## The errors you'll actually run into

A handful of failures account for most of the confusion with this node, and it's worth knowing what each one usually means before you hit it.

A 400 usually means a query parameter or body field is malformed, often an array formatted in a way the API doesn't expect. A 403 almost always means your authentication is wrong or missing scope, not that the URL itself is broken. A 404 means the endpoint doesn't exist, which is worth double-checking against the API's current docs since endpoints do get deprecated. A 429 means you're being rate-limited, and the fix is the node's own **Batching** option under **Add Option**, which lets you space requests out instead of firing them all at once.

The one that catches people the most, especially anyone self-hosting n8n in Docker, is a connection refused error when calling `localhost`. Inside a Docker container, `localhost` refers to the container itself, not your host machine, so a request meant for something running on your host machine's `localhost:3000` will fail every time. On Docker Desktop, `host.docker.internal` gets you there instead; on Linux you'll usually need to add an `extra_hosts` entry pointing at the host gateway.

## A quick example

Say you want to pull a list of open support tickets from an internal helpdesk API and drop the count into Slack. The HTTP Request node handles the first half: method set to GET, URL pointing at `/tickets?status=open`, Header Auth carrying a bearer token stored as a credential rather than typed into the node. Turn on **Include Response Headers and Status** under Response options if you ever need to check the status code downstream instead of just trusting the body came back clean. From there, the response lands in the next node as regular JSON, ready to filter, count, or reshape exactly like data from any of n8n's built-in integrations.

That's really the point of this node. Every dedicated integration in n8n is doing roughly this under the hood, just with the URL and auth pre-filled for one specific service. Once you're comfortable configuring this one by hand, you're not limited to whatever's already been built, you can talk to anything with an API.

## Where this series goes next

Next up, we'll look at Schedule Triggers versus Webhooks, since the HTTP Request node is often the thing you're calling from inside a workflow, but how that workflow gets kicked off in the first place is its own decision with real tradeoffs depending on what you're building.
