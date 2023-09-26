create materialized view events_by_email
ENGINE = MergeTree
PARTITION BY(toYYYYMM(toDateTime(time_sec)))
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
