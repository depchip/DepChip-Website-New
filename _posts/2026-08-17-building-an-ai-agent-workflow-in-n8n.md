---
title: "Building an AI Agent Workflow in n8n with the AI Agent Node and Tools"
description: "How the AI Agent node actually works in n8n: connecting a chat model, tools, and memory, and why it needs at least one tool before it'll even run."
date: 2026-08-17 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, ai-agents, automation]
series: n8n-tutorials
series_order: 16
---

Every workflow we've built up to this point in this series follows a fixed path. A webhook fires, a Set node reshapes the data, an IF node picks a branch, a Slack node posts a message. The logic is decided in advance, node by node, and the workflow just executes it. The AI Agent node breaks that pattern: instead of you deciding which step runs next, the agent looks at the tools it has access to and decides for itself, on each run, which ones it needs and in what order.

That's a real shift in how you design something, not just a new node to drop on the canvas.

## What the AI Agent node actually is

The AI Agent node sits in the `@n8n/n8n-nodes-langchain` package, built on LangChain's agent framework. Functionally, it's a loop: the node sends your prompt and a description of the available tools to a connected language model, the model decides whether it needs to call a tool to answer, the node executes that tool call and feeds the result back to the model, and this repeats until the model has enough information to give a final answer or it hits the iteration limit.

One thing worth knowing if you've touched an older n8n instance: earlier versions let you configure the AI Agent as different agent types, and "Tools Agent" was the one almost everyone used anyway. That option has since been removed. Every AI Agent node now behaves as a Tools Agent by default, so if you're following an older tutorial that mentions choosing an agent type, you can skip that step entirely.

The node itself won't run without help. It needs three things connected to it, and one of them is non-negotiable.

## The chat model connection

The AI Agent node doesn't include a language model itself. You connect one to it through a dedicated `ai_languageModel` input, using a separate chat model node like OpenAI Chat Model, Anthropic Chat Model, or Google Gemini Chat Model, depending on which provider's credentials you're working with. This split matters because it means switching providers is a matter of swapping one node, not rewriting the agent's logic.

There's also a fallback model option in the node's settings. If you enable it and connect a second chat model, the agent will fall back to that model if the primary one fails, which is worth doing before you put anything agent-based in front of real traffic. Model APIs have off days.

## Tools: the part that isn't optional

Here's the detail that trips people up first: n8n requires you to connect at least one tool sub-node to an AI Agent node before it will run. Without a tool, there's nothing for the agent to reason about calling, and the node treats that as a configuration error rather than quietly falling back to plain chat.

A tool can be almost anything. n8n ships a Calculator node for arithmetic, a Code Tool for writing your own logic in JavaScript or Python, an HTTP Request Tool for calling any external API, and a Call n8n Sub-Workflow Tool that lets you package an entire other workflow as something the agent can invoke. Most of the regular action nodes, Slack, Gmail, Telegram, and dozens more, also ship in a "Tool" variant specifically for this purpose.

The HTTP Request Tool is worth calling out specifically because of one field: Description. Whatever you write there is what the model reads to decide when this tool is relevant, so a vague description gets you a tool the agent either never calls or calls at the wrong moment. Writing "fetches the current status of a service from its API" gets you noticeably more reliable behavior than "makes an HTTP request."

## Memory, and why it's separate from the tools

If you want the agent to remember earlier turns in a conversation instead of treating every message as the first one, you connect a memory node through the agent's `ai_memory` input. Simple Memory keeps a rolling window of recent messages in n8n itself with no external service required, which is enough for most single-session use cases. If you need memory that survives a restart or gets shared across separate workflow executions, Postgres, Redis, and a few other backends are available as memory nodes too.

Memory and tools solve different problems. Tools give the agent something to act on. Memory gives it something to remember. An agent can be genuinely useful with tools and no memory at all, particularly for one-shot tasks like "summarize this and post it to Slack" where there's nothing to recall between runs.

## A minimal working shape

The simplest version of this looks like: a Chat Trigger node (or a Manual Chat Trigger, if you're testing inside the n8n editor before wiring up a real front end) feeding into the AI Agent node, with an OpenAI Chat Model connected as the language model and a single HTTP Request Tool connected as the agent's one required tool. That's a working agent. From there, every additional tool you connect just expands what it's capable of deciding to do.

Two settings in the node's options are worth setting deliberately rather than leaving on their defaults. Max Iterations caps how many tool-call round-trips the agent can make before it's forced to stop, and it defaults to 10. That's a reasonable ceiling for most tasks, but if you're giving the agent a genuinely multi-step job, running into that cap mid-task produces a confusing partial answer rather than a clear error, so it's worth raising deliberately rather than discovering the limit by accident. System Message is the other one: it's where you tell the agent what it's for, which tools it has and when to use them, and how you want it to respond. Leaving it at the default "You are a helpful assistant" works for a demo and falls apart the moment the agent has more than one tool to choose between.

## Where this gets more interesting

None of this is dramatic on its own, a chat trigger, a model, one tool. What makes it different from every workflow earlier in this series is that the path through the workflow isn't fixed anymore. Give the same agent five tools and a well-written system message, and it'll take a different route through them depending on what you actually ask it, without you having built an IF node for every possibility in advance. That's also exactly why testing an agent workflow is harder than testing a linear one: you're not just checking that the happy path works, you're checking that the agent makes reasonable decisions across a range of inputs you didn't hand-pick.

## Where this series goes next

The AI Agent node closes out the Foundations arc of this series. From here we move into integrations built around specific platforms, starting with the one DepChip fields the most questions about: Slack, and everything past the basic "post a message when something happens" pattern most people stop at.
