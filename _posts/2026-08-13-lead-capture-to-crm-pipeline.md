---
title: "Building a Lead-Capture-to-CRM Pipeline (Web Form to Airtable/HubSpot)"
description: "How to turn a website contact form into a working lead pipeline with n8n, landing every submission straight into Airtable or HubSpot without a person copying anything by hand."
date: 2026-08-13 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, airtable, hubspot, lead-capture]
series: n8n-tutorials
series_order: 12
---

A contact form that just emails someone is barely better than no form at all. The email sits in an inbox, someone has to notice it, then someone has to go type the name and email into whatever system actually tracks leads. That's the step most teams never automate, and it's the one worth automating first, because a lead sitting untouched for a day is a lead that's noticeably less likely to convert.

This post builds the pipeline that closes that gap: a form submission goes in one end, and a clean record comes out the other in Airtable or HubSpot, depending on what your team already uses to track leads.

## The shape of the pipeline

Three nodes do the actual work, and the shape should look familiar if you've followed this series so far. A trigger catches the submission. A Set node cleans the data up. A destination node writes the record. What changes from the webhook-to-Slack workflow we built earlier is what's on the receiving end, and a couple of details in how that destination node is configured that are easy to get wrong the first time.

## Catching the submission

If you're building the form itself rather than wiring up one that already exists on your site, the **n8n Form Trigger** node is the more direct choice over a plain Webhook. It generates the form page for you, complete with a test URL and a production URL, and lets you mark individual fields as required so incomplete submissions get rejected before they ever reach your workflow. A generic Webhook node still works fine if the form already lives somewhere else and just needs to POST its data at n8n, but then field validation is on you.

Either way, what comes out the other side is the same: a JSON payload with whatever fields the form collected, ready for the next node.

## Cleaning the data before it lands anywhere

Form data is rarely in the shape you want it in a CRM. Names come in with extra whitespace, phone numbers show up in half a dozen formats, and a field left blank shows up as an empty string rather than actually being absent. A Set node between the trigger and the destination is where that gets fixed: trimming strings, normalizing a phone number, and adding a `submittedAt` timestamp so you have a record of exactly when the lead came in, not just when someone happened to look at it.

This step matters more here than it did in the Slack example, because Airtable and HubSpot both care about the shape of what you send them in ways Slack never did.

## Writing to Airtable

If your team uses Airtable as a lightweight CRM, the Airtable node's **Create or Update** operation is what you want, not a plain Create. Create always adds a new row, which means resubmitting the same form (a double click, a retry after a slow connection) gives you duplicate leads. Create or Update instead checks a column you designate, the "Column to Match On," and updates the existing record if it finds a match there instead of creating a second one. Matching on email is the obvious choice for a lead form, since it's the one field that reliably identifies a person across multiple submissions.

On authentication: Airtable fully deprecated its old API keys in February 2024, so an Access Token, generated as a Personal Access Token in Airtable's own settings, is the only realistic option now. n8n's own guidance points the same way. The scopes you need are narrow: read and write access to records, plus read access to base schema so n8n can show you the right fields when you're mapping columns.

## Writing to HubSpot

HubSpot's Contact resource has the same **Create or Update** operation, and it matches on email by default, which is exactly what you want for deduplicating form submissions the same way Airtable does. The field mapping is more involved than Airtable's, since HubSpot expects specific property names on the contact record, but the node's resource mapper handles that once you've picked the right fields.

Authentication is worth getting right up front, because HubSpot has been actively moving people off older methods. Regular API Key auth is deprecated on HubSpot's side, and while it still technically works in n8n's node, building on it now means redoing this later. A Service Key, generated from HubSpot's developer settings, is the currently recommended path for this node, alongside OAuth2 if you'd rather manage it that way. Whichever you pick, the CRM scopes you need up front are contacts, companies, and deals read/write, plus read access to their schemas, since the node needs that to know what it can write.

## Picking one, or wiring up both

Most teams only need one of these, and it's worth resisting the urge to write to both just because you can. Extra destinations mean extra places a workflow can fail, and extra data to keep in sync if a lead's information changes later. If you're genuinely migrating from Airtable to HubSpot, or maintaining both for different halves of the business, a Switch node right after the cleanup step can route the same cleaned data down either path, but that's a real added complexity, not a default worth reaching for on day one.

Once the record lands, a Slack node like the one from the webhook example is a natural next step, so the person who handles new leads doesn't have to go check Airtable or HubSpot to know one arrived. That's the whole pipeline: catch it, clean it, write it once, and tell someone it happened.

## Where this series goes next

This is another workflow that leans on stored authentication to talk to an external system, and by now that's a pattern showing up across most of what we've built in this series. Next we'll look at credentials and environment variables properly: how n8n actually encrypts what you store, when to reach for an environment variable instead of a saved credential, and the mistakes that turn a private workflow into a leaked one.
