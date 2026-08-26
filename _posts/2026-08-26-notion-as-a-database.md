---
title: "Notion as a Database: Reading and Writing Pages with n8n"
description: "How to read and write Notion pages from n8n, and why the node's resource list looks different from older tutorials now that Notion databases are built on data sources."
date: 2026-08-26 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, notion, integrations]
series: n8n-tutorials
series_order: 25
---

Open the Notion node in n8n today and you'll see six resources: Block, Data Source, Database, Database Page, Page, and User. If you learned n8n from an older tutorial, or you're used to treating a Notion database like a single queryable table, that list looks off. There used to just be a "Database" resource with a "Get Many" operation that doubled as a search-and-filter tool. That's gone. Notion restructured how databases work under the hood, and the node had to follow.

## Why there's a "Data Source" resource now

Notion added support for databases with multiple data sources, essentially one database container that can hold more than one underlying table. A "Database" in the Notion API is now mostly metadata: its title, its icon, and a list of the data sources that live inside it. The actual rows, the things you'd normally think of as database entries, belong to a data source, not the database itself.

n8n's node reflects that split directly. The Database resource only has a Get operation, and it returns the database's metadata plus the IDs of its data sources. The Data Source resource has Get and Search, for working with a data source directly. And the resource that does the real work, the one you'll reach for most often, is Database Page: Create, Get, Get Many, and Update. That's where reading and writing rows actually happens, and both Create and Get Many ask for a Data Source, not a Database.

If you've built Notion automations before this change, the one-line summary is: anywhere you used to point a node at a database, you now point it at that database's data source instead. For a database with a single table, which is most of them, that's a small adjustment. For one with multiple data sources, you now have to pick which one you mean.

## Setting up credentials

Notion authentication in n8n goes through an internal integration, not a general OAuth login you'd use as a person. Create one at Notion's integrations page, give it Read, Update, and Insert content capabilities, and copy the integration token into n8n as an API Key credential.

That token alone won't let you touch anything, though. Notion's permission model is opt-in per page: your integration can't see a page or database until you explicitly share it. Open the page in Notion, use the menu in the top right, go to Connections, and connect your integration by name. Skip this step and every API call comes back as though the page doesn't exist, which is a confusing error to debug the first time you hit it because nothing about the credential itself is wrong.

## Reading rows: Database Page, Get Many

To pull rows out of a Notion database, set the resource to Database Page and the operation to Get Many, then point the Data Source field at the table you want. From there you can filter using the Filters option, either building a filter manually property by property or pasting raw JSON if you want Notion's native filter syntax.

The manual filter builder adapts its available conditions to the property type you pick. A Select property gives you Equals and Does Not Equal. A Date property gives you Before, After, Next Week, Past Month, and a handful of other relative options. A Rich Text property gives you Contains, Starts With, and similar string conditions. This is worth knowing going in, because it means the filter you want has to exist for that specific property type. If Notion doesn't support a particular comparison for a given type, the manual builder won't offer it, and you'd need the JSON option or a Notion API filter reference to work around it.

Each returned page comes back as one item, with its properties nested under a `properties` object keyed by property name. Getting a specific value out usually means an expression like `{{ $json.properties['Status'].select.name }}`, since Notion nests every property value inside a small object that also carries its type, not just the raw value.

## Writing rows: Database Page, Create

Creating a page works the same way, resource Database Page, operation Create, again pointed at a Data Source. You give it a title, then use the Properties section to set values on any other fields the table has.

This is the part that trips people up the most: each property has to be shaped to match its type in Notion, not just handed a plain string. A Select field wants the option name. A Multi-Select field wants an array of names. A Date field wants an ISO date string. A Checkbox wants a boolean. Get one of these wrong, say passing a plain string into a Date property, and the create call fails with a schema mismatch rather than silently coercing the value. The property names in the Properties section come from the actual data source schema once you've selected it, so mismatches are more often about value shape than about typos in the field name.

## A pattern worth knowing: page as a lightweight document

Separately from the database-page workflow, the Page resource lets you create and update a standalone page using markdown, which is useful when you want something closer to a document than a spreadsheet row, meeting notes, a generated report, a summary an earlier step in the workflow produced. Update Markdown replaces a page's body content wholesale rather than appending to it, so if you're building something like a running log, Block's Append After operation is usually the better fit: it adds new blocks after an existing one instead of overwriting what's there.

## Where this fits in a real automation

The shape we come back to most often is a webhook or a schedule trigger, a Set node that shapes the incoming data into the right property structure, then a Notion node in Database Page Create mode writing the result in as a new row. Read side works the same way in reverse: Database Page Get Many with a filter, feeding whatever comes back into the rest of the workflow, whether that's a digest message, a report, or a trigger for something downstream.

Notion works well as a lightweight database for exactly this kind of use case, tracking leads, logging events, keeping a simple content calendar, anywhere you want a human-editable table without standing up an actual database server. Just build against the data source model as it exists now, not the single-resource version older guides still describe.

## Where this series goes next

Next up we're doing the same kind of practical walkthrough for Airtable, another spreadsheet-shaped tool that gets used as a lightweight database, and comparing where it's a better or worse fit than Notion for the kind of automations we build most often.
