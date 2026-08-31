---
title: "SMS and Voice Notifications with Twilio"
description: "When a Slack ping isn't enough to get someone's attention, n8n's Twilio node can text or call them directly. Here's how the node actually works and when it's worth the cost."
date: 2026-08-24 09:00:00 +0500
category: n8n-tutorials
tags: [twilio, sms, phone-notifications]
series: n8n-tutorials
series_order: 23
---

Slack and Discord notifications, which we covered earlier in this series, assume someone's looking at their phone or laptop with notifications turned on. Most of the time that's a fair assumption. It stops being fair the moment something breaks at 2am, or a payment fails and someone needs to act on it in the next ten minutes rather than whenever they next check Slack. That's the gap SMS and voice calls fill, and Twilio is the way n8n reaches into that gap.

## What the Twilio node actually sends

The Twilio node in n8n has two resources: SMS and Call. Under SMS, the only operation is Send, and it takes three required fields: `from`, `to`, and `message`. Under Call, the only operation is Make, and it takes the same `from` and `to` fields plus a `message` field that gets read aloud through text-to-speech rather than displayed as text. There's no separate "script" or audio file to upload. Whatever string you put in the message field is what the recipient hears when they pick up.

There's a `toWhatsapp` option tucked into the SMS resource too, which routes the same message through Twilio's WhatsApp API instead of standard SMS. Worth knowing it's there, but it's really a variant of the same node rather than a different workflow, so we won't dwell on it here.

## Setting up credentials the way Twilio actually recommends

Twilio gives you two ways to authenticate, and n8n's credential screen exposes both. The first is your Account SID paired with your Auth Token, both visible right on your Twilio console dashboard. It's the fastest way to get a workflow running, and it's also the one Twilio explicitly says to use for local testing only, not production.

The second is Account SID paired with an API Key SID and API Key Secret, generated separately from your account's API keys page rather than pulled straight off the dashboard. This is the pair Twilio recommends for anything actually running in production, mainly because an API key can be revoked on its own without rotating your entire account's Auth Token and breaking every other integration that depends on it.

If you're building a one-off alert for yourself, the Auth Token method is fine. If you're wiring this into something a client depends on, set up the API key from day one. Rotating credentials later, after other workflows already depend on the old ones, is more annoying than doing it right the first time.

## Sending an SMS when something needs a human right now

A common shape for this: an n8n error workflow (the one we covered a few posts back) catches a failure in some other workflow, and instead of just logging it or posting to a Slack channel nobody's watching at 2am, it fires an SMS straight to whoever's on call. The Twilio node sits at the end of that error workflow with `from` set to your Twilio number, `to` set to the on-call person's number (or pulled dynamically from a rotation stored in a spreadsheet), and `message` built from an expression referencing the failed workflow's name and error output.

One thing worth knowing before you build this: SMS messages get split into segments at 160 characters for plain text, and Twilio bills per segment. A verbose error message that seems reasonable in Slack can quietly turn into three or four billed segments once it goes through SMS. Keep the message short and put the detail in a link back to the execution instead of stuffing it all into the text.

## Making a phone call, not just a text

Some situations genuinely warrant a phone call over a text, mainly because a call demands attention in a way a notification sound doesn't. The Call resource works the same way as SMS structurally, just with the Make operation instead of Send. Whatever you put in the message field gets converted to speech and read to whoever answers.

This is worth reserving for genuinely urgent cases. A phone call at an odd hour trains people to dread automation rather than trust it, and that trust is exactly what makes an approval or alerting workflow worth building in the first place.

## Testing without spending real money

Twilio publishes a set of test credentials specifically so you're not sending real messages (and getting billed for them) while you're still building the workflow. Swap in your test Account SID and Auth Token, and use `+15005550006` as the `from` number. Requests made this way never leave Twilio's own systems, so nothing reaches an actual carrier and nothing shows up on your bill. Twilio documents a whole table of these magic numbers, including ones designed to simulate specific errors like an invalid number, which is a genuinely useful way to check your error workflow actually catches a failed send before you find out the hard way in production.

## Catching replies with the Twilio Trigger

The Twilio node handles outbound messages and calls. The separate Twilio Trigger node handles the other direction: it starts a workflow when Twilio receives an inbound SMS or when a call completes, using a webhook under the hood the same way most of the trigger nodes we've covered so far do. One detail worth flagging if you build on the call side: n8n's own trigger notice says the "New Call" event can take up to thirty minutes to fire after the call actually ends, since it depends on Twilio's call summary insights rather than firing the instant the call hangs up. If you're expecting that trigger to feel instant the way a webhook normally does, it won't, and that's a Twilio timing detail rather than anything n8n is doing wrong.

## Where this fits with everything else in the series

We're not suggesting you route every notification through Twilio. Slack and Discord are free, instant, and fine for the vast majority of what you'll automate. Reach for SMS and voice specifically for the notifications where missing them has a real cost: production outages, failed payments, anything with a clock attached. Used sparingly, it earns the attention it demands. Used for routine status updates, it just becomes noise people learn to ignore, which defeats the point of building it in the first place.

Next up, we're moving from messaging into scheduling: how Google Calendar and Outlook events can act as triggers in n8n, so a workflow can kick off the moment something lands on someone's calendar rather than on a fixed cron schedule.
