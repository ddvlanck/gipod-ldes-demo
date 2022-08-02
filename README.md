# GIPOD LDES Demo

This demo uses the LDES client and replicates the GIPOD mobility hindrance LDES to a MongoDB database.

## Usage

### 1. Init the database

Depending on which backend you want to use, a different _docker-compose_ file has to be executed:
- Mongo: `docker-compose -f docker-compose-mongo.yml up`
- Postgis `docker-compose -f docker-compose-postgis.yml up`

Both docker-compose files will initiate two containers. A container containing the actual database (mongo or postgis), and a second one that provides a Web-based admin interface (Mongo Express or PgAdmin) that allows easy interaction with the database.

#### Mongo as database

The init script will create a new database called `ldes` with two collections in it:
- `ldes_entity_timestamp` → contains the entity URIs along with the timestamp of the most recent version
- `ldes_data` → contains the mobility hindrances

#### Postgis as database
The init script will create a new database called `ldes` that contains two tables:
- `version_metadata` → contains the entity URIs along with the timestamp of the most recent version
- `mobility_hindrances` → contains the mobility hindrances

#### Troubleshooting

It is possible that upon the first run, the `mongo-express` container fails to run. This is because `mongo-express` tries to connect to the MongoDB database in the `mongo` container, and it is not fully initialized yet.

When this issue occurs, just restart the `mongo-express` container:
```bash
> docker start mongo-express
``` 

### 2. Running the script

First, install the necessary packages with the following command:
```bash
> npm install
```

The code is written in Typescript and must be compiled to Javascript in order to execute it:
```bash
> npm run build
```

When the code is compiled to Javascript, navigate to the `bin` folder and execute the following command:
```bash
> node --max-old-space-size=8192 cli-runner.js -u {GIPOD-LDES-URL} -d {DATABASE}
```

Options for database parameter are `mongo` or `postgis`.

#### What the script does

The script will create a database and LDES client. If the LDES client has had a previous run, the previous state will be imported into the current LDES client, so that it does not start iterating the LDES from the beginning, but from the point where it previously stopped.

**For this demo, we simulate that we only want the latest version of every object.**

For every member we receive from the LDES client, we execute the `handleMember` function.

For Mongo, within the `handleMember` function, we check if the mobility hindrance has a consequence in which we are interested. The list of consequences that are used to filter can be found in the [Mongo class](./lib/Mongo.ts). For PostGis, we add every mobility hindrance.

For every entity that is added to the database, we store the timestamp of its latest version. So, for every version of an entity that we receive, we query the timestamp collection/table to check if the timestamp of the received version is more recent than the one already in the database. If that is the case, the means the version that we received is more recent than the one in the database. So, then we update the database with the newest version for the entity, and we also update to timestamp collection/table with the timestamp of the newest version.

**As timestamp, we use the `createdOn` field of a mobility hindrance, as this indicates at which time the 'event' occurred.**
