create table if not exists raw_events (
  id String NOT NULL DEFAULT '',
  `data` String NOT NULL DEFAULT '',
  `type` LowCardinality(String) NOT NULL DEFAULT '',
  time_sec Int64 NOT NULL DEFAULT 0
)
ENGINE = MergeTree
PARTITION BY(toYYYYMM(toDateTime(time_sec)))
ORDER BY (`type`, time_sec)
