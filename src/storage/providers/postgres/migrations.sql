create table if not exists stripe_events (
  object_type text not null,
  id text not null,
  time_sec int8 not null,
  data jsonb not null,

  primary key(time_sec, id)
);

-- functional indexes
create index if not exists stripe_events_by_email on stripe_events((data->>'receipt_email')) where data->>'receipt_email' is not null;
create index if not exists  stripe_events_by_customer on stripe_events((data->>'customer')) where data->>'customer' is not null;
create index if not exists  stripe_events_by_meta_ip on stripe_events((data->'meta'->>'ip')) where data->'meta'->>'ip' is not null;
