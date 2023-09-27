# OpenSigma

An open source version of Stripe's Sigma: Analytics and archival of Stripe events. Backfills from existing events, and receives new updates through Stripe webhooks.

Designed to be run with Bun.

## Features

- Accept webhooks directly from Stripe, or relay thrm through your API
- Different storage providers for string data (many derivative indexes, materialized views, etc. provided) (prefer ClickHouse or Tinybird)
- Backfill specific data types from Stripe API

## Motivation

Stripe deletes most data from events after 30 days. This is not a lot of time, especially if you need to check something like a checkout session's metadata.

They go from looking like this:

![normal](/assets/normal.png)

To looking like this:

![expired](/assets/expired.png)

From 97 lines of data down to 3. Ouch.

They also have a product, Sigma, to query your Stripe data, but that has a per-transaction cost along with an increasing base cost, minimum $10. You also need to enable this before they collect data, so any objects >30 days old are also lost.

This solution allows you to get most of this functionality for free in a database you control.

## Limitations

The system is inherently limited to only backfilling for object types that can be listed without an ID. For example [application fee refunds](https://stripe.com/docs/api/fee_refunds) are not backfilled because they require an `:id` in the url path.

## Direct insert endpoint (relay from your API)

If you are already accepting all webhooks, then the `/direct` endpoint lets you send the JSON body from your existing service that already received a stripe webhook. This basically just avoids the signature check.
