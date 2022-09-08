CREATE TABLE ldes.mobility_hindrances
(
  "version_id" character varying NOT NULL,
  "gipod_id" bigint NOT NULL,
  "identifier_assigned_by_name" character varying,
  "description" character varying,
  "owner_is_version_of" character varying,
  "owner_preferred_name" character varying,
  "zone_id" character varying,
  "zone_consequence" json,
  "zone_consequence_label" character varying[],
  "zone_geometry_wkt" geometry,
  "zone_type" character varying,
  "period_start" timestamp with time zone,
  "period_end" timestamp with time zone,
  "time_schedule_start_date" date,
  "time_schedule_end_date" date,
  "time_schedule_repeat_frequency" character varying,
  "time_schedule_start_time" character varying,
  "time_schedule_end_time" character varying,
  "time_schedule_by_day" character varying[],
  "time_schedule_by_month" smallint[],
  "time_schedule_by_month_day" smallint[],
  "status" character varying,
  "generated_at_time" timestamp,
  "last_event_name" character varying,
  "entity_id" character varying UNIQUE NOT NULL,
  "created_on" timestamp with time zone NOT NULL,
  PRIMARY KEY ("version_id")
)

TABLESPACE pg_default;

ALTER TABLE ldes.mobility_hindrances
  OWNER to ldes;

COMMENT ON TABLE ldes.mobility_hindrances
  IS 'Stores mobility hindrance version objects.';

CREATE INDEX IF NOT EXISTS ix_geometry
    ON ldes.mobility_hindrances USING gist
        (zone_geometry_wkt)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ix_gipod_id
    ON ldes.mobility_hindrances USING btree
        (gipod_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ix_period_end
    ON ldes.mobility_hindrances USING btree
        (period_end ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ix_period_start
    ON ldes.mobility_hindrances USING btree
        (period_start ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ix_version_id
    ON ldes.mobility_hindrances USING btree
        (version_id COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS ix_status
    ON ldes.mobility_hindrances USING btree
        (status COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

