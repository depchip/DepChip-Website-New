---
title: "Calendar Automation: Google Calendar and Outlook Events as Triggers"
description: "How to kick off an n8n workflow from a calendar event instead of a fixed schedule, and why Google Calendar and Outlook need genuinely different approaches to get there."
date: 2026-08-25 09:00:00 +0500
category: n8n-tutorials
tags: [n8n, google-calendar, outlook, triggers]
series: n8n-tutorials
series_order: 24
---

Most of the scheduling we've covered in this series runs on a timer. A Schedule Trigger fires every hour, every morning at nine, every Monday. That works fine when the thing you care about happens on a predictable clock. It falls apart the moment what actually matters is a calendar event itself: a meeting getting booked, a reminder someone set landing on today's date, an appointment being cancelled. You don't want to poll a spreadsheet every five minutes to catch that. You want the calendar to tell you.

## Google Calendar has a real trigger node

Google Calendar Trigger is a dedicated node, and it's the more straightforward of the two platforms to work with here. You point it at a calendar using a resource locator, either by picking one from a searchable list or pasting in a calendar ID directly, and then you choose what you're triggering on: Event Created, Event Updated, Event Cancelled, Event Started, or Event Ended.

That last pair is worth pausing on, because it's not obvious from the names alone. Event Started and Event Ended don't fire when someone creates or edits an event, they fire relative to the event's actual start and end time. So a meeting scheduled for 2pm triggers "Event Started" at 2pm, regardless of when it was put on the calendar. That's the node to reach for if you want something to happen at the moment a meeting begins, like posting a Slack reminder with the video call link, rather than the moment it gets booked.

The node also has one options field worth knowing about: Match Term, a free-text filter that only lets events through if they match a term somewhere in their fields. It's a blunt filter, not a structured query against title versus description versus attendees separately, but it's enough to scope a workflow to, say, only events with "Interview" in the title rather than firing on every single thing that lands on a shared calendar.

One thing we checked directly rather than assumed: the node's options don't include anything for tuning how it polls. Gmail Trigger, for comparison, exposes a Max Emails per Poll field that lets you cap how much it fetches on each check. Google Calendar Trigger has nothing like it. Calendar and Match Term are the only two settings on offer, and the polling itself happens on a fixed cadence under the hood. If you're coming from a node with more configurable polling behavior, don't go looking for the same controls here. They aren't there.

## Outlook doesn't have an equivalent trigger at all

This is the part that catches people off guard. n8n ships a Microsoft Outlook Trigger node, and if you haven't looked closely you'd reasonably assume it does for Outlook what Google Calendar Trigger does for Google. It doesn't. Microsoft Outlook Trigger only watches for new email arriving in a mailbox, on a polling interval, the same shape as Gmail Trigger. There is no dedicated node that starts a workflow when an Outlook calendar event is created or changed.

What n8n does provide is the regular Microsoft Outlook node, which has separate Calendar and Event resources with Create, Get, Get Many, Update, and Delete operations. That's plenty to work with calendar data, just not as a trigger. To get calendar-driven automation out of Outlook, you build the polling yourself: a Schedule Trigger running on whatever interval you want, feeding into a Microsoft Outlook node set to Event > Get Many, filtered to a time window that matches how often you're polling. Compare the results against what you saw last run, using something like a Postgres table, a Data Table, or even a simple JSON file, and treat anything new as your trigger.

It's more setup than a single node, but it isn't complicated once you see the shape of it, and it's a pattern that shows up constantly outside of calendars too. Any time n8n doesn't ship a dedicated trigger for something, this same combination, a Schedule Trigger plus a "get many" operation plus a way to remember what you've already seen, is usually the answer.

## Deduplication is the part people skip

Whichever platform you're on, there's a failure mode worth designing around from the start: a poll-based trigger can see the same event more than once. Google Calendar Trigger handles this internally for you, tracking what it's already reported so you don't get duplicate Event Created firings for the same event. A hand-rolled Outlook polling setup doesn't get that for free. If your Schedule Trigger runs every five minutes and an event sits inside two overlapping query windows, without your own deduplication step you'll process it twice.

The fix is the same idea we covered back in the error handling and retries post: keep a record of event IDs your workflow has already acted on, and check against it before doing anything with side effects, like sending a notification or writing a database row. A simple approach is storing the event ID and a timestamp somewhere durable, and filtering out anything you've already seen before the rest of the workflow runs. It's a small amount of extra plumbing that saves you from a genuinely annoying bug: a meeting reminder that fires three times because your polling windows overlapped.

## A shape worth building once

Put together, a reasonable "notify the team when something lands on the shared calendar" workflow looks like this on Google Calendar: a Google Calendar Trigger set to Event Created, feeding a Set node that pulls out the fields you care about, feeding a Slack node that posts the summary. Three nodes, and it's live the moment someone books something.

On Outlook, the same outcome takes a Schedule Trigger, a Microsoft Outlook node querying Event > Get Many for the last polling window, a filter step that drops anything you've already seen, and then the same Set and Slack nodes at the end. More moving parts, but each one is doing something you understand, and none of it is exotic.

## Where this series goes next

Calendar triggers wrap up the Comms integrations arc. Next we're shifting into productivity and data tooling, starting with Notion: reading and writing pages from n8n, and where a page-based database like Notion's is genuinely a good fit for a workflow versus where you'd be better off with something more structured.
