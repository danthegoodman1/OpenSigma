create materialized view events_by_email
ENGINE = MergeTree
PARTITION BY murmurHash2_32(email) % 32
ORDER BY (email, time_sec)
AS select
  JSONExtractString(`data`, 'receipt_email') as email
  , JSONExtractString(`data`, 'customer') as customer
  , id
  , time_sec
  , object_type
  , `data`
from raw_events
where email != ''
