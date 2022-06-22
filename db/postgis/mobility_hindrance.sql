CREATE TABLE ldes.mobility_hindrances
(
  "version_id" character varying NOT NULL,
  "entity_id" character varying NOT NULL,
  "created_on" character varying NOT NULL,
  "wkt" character varying NOT NULL,
  "period" character varying,
  PRIMARY KEY ("version_id")
)

TABLESPACE pg_default;

ALTER TABLE ldes.mobility_hindrances
  OWNER to ldes;

COMMENT ON TABLE ldes.mobility_hindrances
  IS 'Stores mobility hindrance version objects.';