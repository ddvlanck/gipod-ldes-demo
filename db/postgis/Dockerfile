FROM postgis/postgis

COPY init_db.sql /docker-entrypoint-initdb.d/01-init_db.sql
COPY mobility_hindrance.sql /docker-entrypoint-initdb.d/02-mobility_hindrance.sql
COPY version_metadata.sql /docker-entrypoint-initdb.d/03-version_metadata.sql