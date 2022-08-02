CREATE TABLE ldes.mobility_hindrances
(
  "version_id" character varying NOT NULL,
  "gipod_id" bigint NOT NULL,
  "identifier_assignedByName" character varying,
  "is_consequence_of" bigint,
  "description" character varying,
  "owner_is_version_of" character varying,
  "owner_preferred_name" character varying,
  "zone_id" character varying,
  "zone_consequence" json,
  "zone_geometry_wkt" geometry,
  "zone_type" character varying,
  "period_start" character varying,
  "period_end" character varying,
  "status" character varying,
  "generated_at_time" character varying,
  "event_name" character varying,
  "entity_id" character varying NOT NULL,
  "created_on" character varying NOT NULL,
  PRIMARY KEY ("version_id")
)

TABLESPACE pg_default;

ALTER TABLE ldes.mobility_hindrances
  OWNER to ldes;

COMMENT ON TABLE ldes.mobility_hindrances
  IS 'Stores mobility hindrance version objects.';