create materialized view pi_by_cs -- all payment intents by checkout session
ENGINE = MergeTree
PARTITION BY murmurHash2_32(checkout_session) % 32 -- random partition
ORDER BY (checkout_session, id, time_sec)
settings index_granularity=128
AS
with cs as (
  select
    id as checkout_session
    , JSONExtractString(`data`, 'payment_intent') as id
  from raw_events
  where object_type = 'checkout_session'
  order by time_sec desc
  limit 1 by id -- get latest version of it
)
select
  checkout_session
  , JSONExtractString(raw_events.data, 'payment_intent') as id
  , raw_events.data `data`
  , raw_events.time_sec time_sec
from cs
left join raw_events
on cs.id = raw_events.id
where object_type = 'payment_intent'


-- another version --

create materialized view pi_by_cs -- all payment intents by checkout session
ENGINE = MergeTree
PARTITION BY murmurHash2_32(checkout_session) % 32 -- random partition
ORDER BY (checkout_session, id, time_sec)
settings index_granularity=128
AS
select
  -- * EXCEPT(id, object_type)
  checkout_session,
  id,
  `data`,
  time_sec
from (
  select
    id as checkout_session
    , JSONExtractString(`data`, 'payment_intent') as id
  from raw_events
  where object_type = 'checkout_session'
  order by time_sec desc
  limit 1 by id -- get latest version of it
) checkout_sessions left join (
  select *
  from raw_events
  where object_type = 'payment_intent'
) payment_intents using id


-----------------------------------

create materialized view ch_by_cs -- all charges by payment intent
ENGINE = MergeTree
PARTITION BY murmurHash2_32(checkout_session) % 32 -- random partition
ORDER BY (checkout_session, id, time_sec)
settings index_granularity=128
AS
select
  -- * EXCEPT(id, object_type)
  checkout_session,
  payment_intent,
  id,
  `data`,
  time_sec
from (
  select
    checkout_session
    , id as payment_intent
  from pi_by_cs
  order by time_sec desc
  limit 1 by payment_intent -- get latest version of it
) payment_intents left join (
  select *, JSONExtractString(`data`, 'payment_intent') as payment_intent
  from raw_events
  where object_type = 'charge'
) charges using payment_intent
