create table if not exists raw_events (
  id String NOT NULL DEFAULT '',
  `data` String NOT NULL DEFAULT '',
  object_type LowCardinality(String) NOT NULL DEFAULT '',
  event_type LowCardinality(String) NOT NULL DEFAULT '',
  time_sec Int64 NOT NULL DEFAULT 0,
  PROJECTION by_event_Type (
    select *
    order by (event_type, time_sec, id)
  )
)
ENGINE = MergeTree
PARTITION BY(toYYYYMM(toDateTime(time_sec)))
ORDER BY (object_type, time_sec, id)
