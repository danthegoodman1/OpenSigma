create table if not exists latest_events (
  id String NOT NULL DEFAULT '',
  `data` String NOT NULL DEFAULT '',
  object_type LowCardinality(String) NOT NULL DEFAULT '',
  time_sec Int64 NOT NULL DEFAULT 0
)
ENGINE = ReplacingMergeTree(time_sec)
PARTITION BY(toYYYYMM(toDateTime(time_sec)))
ORDER BY (object_type, time_sec)
;

create materialized view if not exists latest_events_mv to latest_events AS
SELECT
  id
  , argMax(`data`, time_sec) `data`
  , object_type
  , max(time_sec) time_sec
FROM raw_events
group by object_type, id
;
