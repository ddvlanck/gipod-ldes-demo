select t. category, row_number() OVER () as id
from
(
select distinct(unnest(zone_consequence_label::text[][])) as category
from mobility_hindrances) as t;


do
$$
declare
    f record;
begin
    for f in select t. category, row_number() OVER () as id from ( select distinct(unnest(zone_consequence_label::text[][])) as category from mobility_hindrances) as t 
    LOOP
		EXECUTE format('DROP TABLE "' || f.category || '";');
        	EXECUTE format('CREATE TABLE "' || f.category || '" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, left(periode_start::text, 10) as time_start, left(periode_end::text, 10) as time_end, * from mobility_hindrances) as t where t.category = ''' || f.category ||''' ;');
		EXECUTE format('ALTER TABLE "' || f.category || '"  DROP COLUMN zone_geometry_wkt;');
    END LOOP;
end;
$$
LANGUAGE plpgsql;


select t. category, row_number() OVER () as id
from
(
select distinct(unnest(zone_consequence_label::text[][])) as category
from mobility_hindrances) as t;

select *
from
(select unnest(zone_consequence_label::text[][]) as category, *
from mobility_hindrances) as t
where t.category = f.category;




do
$$
declare
    f record;
begin
    for f in select t. category, row_number() OVER () as id from ( select distinct(unnest(zone_consequence_label::text[][])) as category from mobility_hindrances) as t 
    LOOP
		EXECUTE format('DROP TABLE "' || f.category || '";');
        EXECUTE format('CREATE TABLE "' || f.category || '" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = ''' || f.category ||''' ;');
		EXECUTE format('ALTER TABLE "' || f.category || '"  DROP COLUMN zone_geometry_wkt;');
    END LOOP;
end;
$$
LANGUAGE plpgsql;

"""
CREATE VIEW "Verboden voor + 3,5 ton" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Verboden voor + 3,5 ton';
CREATE VIEW "Geen doorgang voor voetgangers" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Geen doorgang voor voetgangers';
CREATE VIEW "Geen doorgang voor gemotoriseerd verkeer" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Geen doorgang voor gemotoriseerd verkeer';
CREATE VIEW "Geen doorgang voor fietsers" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Geen doorgang voor fietsers';
CREATE VIEW "Snelheidsbeperking" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Snelheidsbeperking';
CREATE VIEW "Wisselend verkeer via verkeerslichten" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Wisselend verkeer via verkeerslichten';
CREATE VIEW "Handelaars moeilijk bereikbaar" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Handelaars moeilijk bereikbaar';
CREATE VIEW "Wisselend verkeer via verkeersborden" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Wisselend verkeer via verkeersborden';
CREATE VIEW "Verboden voor + 7,5 ton" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Verboden voor + 7,5 ton';
CREATE VIEW "Vermindering van rijstroken" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Vermindering van rijstroken';
CREATE VIEW "Versmalde rijstroken" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Versmalde rijstroken';
CREATE VIEW "Geen doorgang voor gemotoriseerd verkeer uitgezonderd plaatselijk verkeer" as select * from (select unnest(zone_consequence_label::text[][]) as category, ST_SETSRID(zone_geometry_wkt, 31370) as geometry, * from mobility_hindrances) as t where t.category = 'Geen doorgang voor gemotoriseerd verkeer uitgezonderd plaatselijk verkeer';
"""


drop table unnest_stats;

create table unnest_stats as
select unnest(zone_consequence_label::text[][]), left(period_start::text, 10) as start, left(period_end::text, 10) as end
from mobility_hindrances
where period_start > '2020-01-01' and period_end < '2022-12-24'
order by period_start
limit 20;

do $$
begin
   for cnt in '2020-01-01'::date ..'2022-12-24'::date loop
    raise notice 'cnt: %', cnt;
   end loop;
end; $$

create table overview_stats as
SELECT date_trunc('day', dd):: date
FROM generate_series
        ( '2020-01-01'::timestamp 
        , '2022-12-31'::timestamp
        , '1 day'::interval) dd
        ;

select *
from overview_stats
limit 10;




do
$$
declare
    f record;
begin
    for f in select date from unnest_stats
    LOOP
		EXECUTE format('update overview_stats set count =  select count(*)::intfrom unnest_stats where "start"::date<= '|| f.date ||'::date AND "end"::date >=  '|| f.date  ||'::date where date_trunc = '|| f.date  ||';');

    END LOOP;
end;
$$
LANGUAGE plpgsql;

select count(*)::int
from unnest_stats
where "start"::date<= '2020-01-01'::date 
AND "end"::date >=  '2020-01-01'::date

do
$$
declare
    f record;
begin
    for f in select date_trunc::date, count from overview_stats
    LOOP
		EXECUTE format('update overview_stats set count =  t.count from (select count(*) from unnest_stats where "start"::date<= '''|| f.date_trunc ||'''::date AND "end"::date >=  '''|| f.date_trunc  ||'''::date) as t where date_trunc::date = '''|| f.date_trunc  ||'''::date;');

    END LOOP;
end;
$$
LANGUAGE plpgsql;


drop table overview_stas;

create table esrijson as
SELECT
GENERATE_SERIES
(t.start, t.end, '1 DAY')::date AS sd,
t.* FROM (select unnest(zone_consequence_label::text[][]), left(period_start::text, 10)::date as start, left(period_end::text, 10)::date as end, '{  “rings“:' || (ST_AsGeoJSON(ST_ASTEXT(ST_TRANSFORM(ST_SETSRID(zone_geometry_wkt, 31370), 4326)))::json ->'coordinates')::text || ',"spatialReference":{"wkid":4326}', *
from mobility_hindrances
where ST_ASTEXT(zone_geometry_wkt) LIKE 'POLY%')t
ORDER BY t.start;

select '{  “rings“:' || (ST_AsGeoJSON(ST_ASTEXT(ST_TRANSFORM(ST_SETSRID(zone_geometry_wkt, 31370), 4326)))::json ->'coordinates')::text || ',"spatialReference":{"wkid":4326}'
from mobility_hindrances
limit 10;


drop table esrijson;

create table esrijson as
SELECT
GENERATE_SERIES
(t.start, t.end, '1 DAY')::date AS sd,
t.* FROM (select unnest(zone_consequence_label::text[][]), left(period_start::text, 10)::date as start, left(period_end::text, 10)::date as end, '{  “rings“:' || (ST_AsGeoJSON(ST_ASTEXT(ST_TRANSFORM(ST_SETSRID(zone_geometry_wkt, 31370), 4326)))::json ->'coordinates')::text || ',"spatialReference":{"wkid":4326}' as geometry, *
from mobility_hindrances
where ST_ASTEXT(zone_geometry_wkt) LIKE 'POLY%')t
ORDER BY t.start;

create table esrijson as
SELECT
GENERATE_SERIES
(t.start, t.end, '1 DAY')::date AS sd,
t.* FROM (select unnest(zone_consequence_label::text[][]), left(period_start::text, 10)::date as start, left(period_end::text, 10)::date as end, '{  “rings“:' || (ST_AsGeoJSON(ST_ASTEXT(ST_TRANSFORM(ST_SETSRID(zone_geometry_wkt, 31370), 4326)))::json ->'coordinates')::text || ',"spatialReference":{"wkid":4326}' as geometry, *
from mobility_hindrances
where ST_ASTEXT(zone_geometry_wkt) LIKE 'POLY%')t
ORDER BY t.start;



drop table stats;
create table stats as
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


--------------------------------------------------------------------

create table unnest_stats2 as
select unnest(zone_consequence_label::text[][]), left(period_start::text, 10) as start, left(period_end::text, 10) as end,
ST_X(ST_CENTROID(ST_transform(ST_SETSRID(zone_geometry_wkt, 31370), 4326))) as longitude, ST_Y(ST_CENTROID(ST_transform(ST_SETSRID(zone_geometry_wkt, 31370), 4326))) as latitude, *
from mobility_hindrances
where period_start > '2020-01-01' and period_end < '2022-12-24'
order by period_start
limit 20;


create table category as
select distinct(unnest(zone_consequence_label::text[][]))
from mobility_hindrance;


create table owner as
select distinct(owner_preferred_name)
from mobility_hindrance;

