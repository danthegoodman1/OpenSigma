create table if not exists stripe_events (
  object_type text not null,
  id text not null,
  time_sec int8 not null,
  data json not null,

  primary key(time_sec, id)
);
