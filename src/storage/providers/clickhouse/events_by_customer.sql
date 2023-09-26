create materialized view events_by_customer
ENGINE = MergeTree
PARTITION BY murmurHash2_32(customer) % 32
ORDER BY (customer, time_sec)
AS select
  JSONExtractString(`data`, 'customer') as customer
  , JSONExtractString(`data`, 'email') as email
  , id
  , time_sec
  , object_type
  , `data`
from raw_events
where customer != ''
