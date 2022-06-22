CREATE TABLE ldes.version_metadata
(
  "entity_id" character varying NOT NULL,
  "timestamp" character varying NOT NULL,
  PRIMARY KEY ("entity_id")
)

TABLESPACE pg_default;

ALTER TABLE ldes.version_metadata
  OWNER to ldes;

COMMENT ON TABLE ldes.version_metadata
  IS 'Stores timestamp of most recent version for every entity.';