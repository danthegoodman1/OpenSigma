# OpenSigma

An open source version of Stripe's Sigma: Analytics and archival of Stripe events.

backfills from existing events, and receives new updates through Stripe webhooks.

## Features

Point webhooks at OpenSigma (and optionally run a backfill job) to start collecting your Stripe data. Then query with Postgres' JSON operators.

### Event history

Stores the history of events, and the lifecycle of each object as they change, incrementing their version number. You can see how a charge, subscription, account, etc. changes over time.

## Motivation

Stripe deletes most data from events after 30 days. This is not a lot of time, especially if you need to check something like a check session's metadata.

They also have a product, Sigma, to query your Stripe data, but that has a per-transaction cost along with an increasing base cost, minimum $10.

This solution allows you to get most of this functionality for free in a database you control.

## Security

OpenSigma uses Inngest, which has a free tier as well. While Inngest is used for background job processing, no data from your Stripe events is ever persisted besides IDs. Therefore Inngest will never have any info about what your Stripe events contain.

Any information that does need to be passed to an Inngest function is proxied through the database with an anonymous ID.

The only place *potentially* sensitive data is stored is in the DB. Logging only includes IDs.

## How to host

The service is designed to be backed by Postgres/CRDB (with optional TimescaleDB support), and run with a Docker container. A simple and free solution is to use GCP Cloud Run + Supabase to get free container hosting and a free postgres DB with TimescaleDB support.

You also need to use Inngest if you plan to run backfill. They have a free tier as well. Inngest is only used for backfill jobs, not for normal webhook ingestion. Inngest must be explicitly enabled with the env var `ENABLE_INNGEST=true`, along with the required keys.

With Supabase you can also build some cool DB triggers to alert you when something happens. For example:

1. When X early fraud warnings are created within Y minutes
2. When a customer reaches $100 in payouts, send them a congratulatory email
3. When a certain number of payments fail from a given user in Y minutes


You can also stick cool metrics in your observability tools like:

1. Running calculation of successful vs. finished checkout sessions
2. Distribution of payouts among customers

I have no plans to offer managed solutions, I don't want your data.

## Limitations

The system is inherently limited to only backfilling for object types that can be listed without an ID. For example [application fee refunds](https://stripe.com/docs/api/fee_refunds) are not backfilled because they require an `:id` in the url path.
