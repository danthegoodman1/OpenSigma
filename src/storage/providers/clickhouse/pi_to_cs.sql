create materialized view pi_to_cs -- payment intent to checkout session
ENGINE = ReplacingMergeTree(time_sec) -- the latest record
PARTITION BY murmurHash2_32(id) % 32 -- random partition
ORDER BY (payment_intent, time_sec)
settings index_granularity=128
AS select
  JSONExtractString(`data`, 'payment_intent') as payment_intent
  , id as checkout_session
  , time_sec
from raw_events
where payment_intent != ''
and object_type = 'checkout_session'
