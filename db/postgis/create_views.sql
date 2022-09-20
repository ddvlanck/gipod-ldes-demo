do
$$
declare
    f record;
begin
    for f in select t. category, row_number() OVER () as id from ( select distinct(unnest(zone_consequence_label::text[][])) as category from mobility_hindrances) as t 
    LOOP

        	EXECUTE format('CREATE VIEW "' || f.category || '" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, left(period_start::text, 10) as time_start, left(period_end::text, 10) as time_end, * from mobility_hindrances) as t where t.category = ''' || f.category ||''' ;');

    END LOOP;
end;
$$
LANGUAGE plpgsql;

create VIEW overview_stats as
SELECT
GENERATE_SERIES
(t.start, t.end, '1 DAY')::date AS sd,
t.* FROM (select unnest(zone_consequence_label::text[][]), left(period_start::text, 10)::date as start, left(period_end::text, 10)::date as end, *
from mobility_hindrances
where ST_ASTEXT(zone_geometry_wkt) LIKE 'POLY%')t
ORDER BY t.start;

create VIEW stats as
select q.sd, q.unnest, count(*) from
(SELECT
GENERATE_SERIES
(t.start, t.end, '1 DAY')::date AS sd,
t.* FROM (select unnest(zone_consequence_label::text[][]), left(period_start::text, 10)::date as start, left(period_end::text, 10)::date as end, '{  “rings“:' || (ST_AsGeoJSON(ST_ASTEXT(ST_TRANSFORM(ST_SETSRID(zone_geometry_wkt, 31370), 4326)))::json ->'coordinates')::text || ',"spatialReference":{"wkid":4326}', *
from mobility_hindrances

)as t
 ORDER BY t.start
) as q
group by q.sd, q.unnest;

create VIEW unnest_stats2 as
select unnest(zone_consequence_label::text[][]), left(period_start::text, 10) as start, left(period_end::text, 10) as end,
ST_X(ST_CENTROID(ST_transform(ST_SETSRID(zone_geometry_wkt, 31370), 4326))) as longitude, ST_Y(ST_CENTROID(ST_transform(ST_SETSRID(zone_geometry_wkt, 31370), 4326))) as latitude, *
from mobility_hindrances
where period_start > '2020-01-01' and period_end < '2022-12-24'
order by period_start;

create VIEW category as
select distinct(unnest(zone_consequence_label::text[][]))
from mobility_hindrances;


create VIEW owner as
select distinct(owner_preferred_name)
from mobility_hindrances;