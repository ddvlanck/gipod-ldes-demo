# GIPOD LDES Demo

This demo uses the LDES client and replicates the GIPOD mobility hindrance LDES to a MongoDB database.

## Usage

### 1. Init the database

Depending on which backend you want to use, a different _docker-compose_ file has to be executed:
- Mongo: `docker-compose -f docker-compose-mongo.yml up (--build)`
- PostGIS `docker-compose -f docker-compose-postgis.yml up (--build)`
  Neo4j `docker-compose -f docker-compose-neo4j.yml up --build`

All docker-compose files will initiate at least two containers. A container containing the actual database (mongo, postgis or neo4j), and a second one that provides a Web-based admin interface (Mongo Express, PgAdmin or Neo4j Browser) that allows easy interaction with the database.

**Note**: the docker-compose file for PostGIS will automatically start up the application and geoserver as well.

#### Mongo as database

The init script will create a new database called `ldes` with two collections in it:
- `ldes_entity_timestamp` → contains the entity URIs along with the timestamp of the most recent version
- `ldes_data` → contains the mobility hindrances

#### Postgis as database
The init script will create a new database called `ldes` that contains two tables:
- `version_metadata` → contains the entity URIs along with the timestamp of the most recent version
- `mobility_hindrances` → contains the mobility hindrances

#### Neo4j as database
Neo4j will be configured to import RDF. The RDF can be queries through Neo4j Browser or by connecting to Neo4j with another application.

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

Before the script can be executed, a configuration file has to be made. The root folder already contains the configuration file and the possible fields that can be used:
- `ldes` → The URL of the GIPOD LDES
- `database.type` → The database that should be used to replicate to LDES to. Possible values are `mongo`, `postgis` and `neo4j`

Depending on the chosen database type, additional database configuration fields must be used:
- **Mongo**
  - `database.connection_string` → Value: `mongodb://admin:admin@localhost:27017`
- **Neo4j**
  - `database.connection_string` → Value: `neo4j://localhost`
  - `database.user` → Value: `neo4j`
  - `database.password` → Value: `ldes`
- **PostGIS**
  - `database.user` → Value: `ldes`
  - `database.password` → Value: `ldes`
  - `database.host` → Value: `localhost`
  - `database.port` → Value: `5432`
  - `database.database` → Value: `mobility_hindrance`


When the code is compiled to Javascript and configuration file is filled out, navigate to the `bin` folder and execute the following command:
```bash
> node --max-old-space-size=8192 cli-runner.js
```

#### What the script does

The script will create a database client and LDES client. If the LDES client has had a previous run, the previous state will be imported into the current LDES client, so that it does not start iterating the LDES from the beginning, but from the point where it previously stopped.

**For this demo, we simulate that we only want the latest version of every object.**

For every member we receive from the LDES client, we execute the `handleMember` function.

For Mongo, within the `handleMember` function, we check if the mobility hindrance has a consequence in which we are interested. The list of consequences that are used to filter can be found in the [Mongo class](./lib/Mongo.ts). For PostGis, we add every mobility hindrance.

For every entity that is added to the database, we store the timestamp of its latest version. So, for every version of an entity that we receive, we query the timestamp collection/table to check if the timestamp of the received version is more recent than the one already in the database. If that is the case, the means the version that we received is more recent than the one in the database. So, then we update the database with the newest version for the entity, and we also update to timestamp collection/table with the timestamp of the newest version.

**As timestamp, we use the `createdOn` field of a mobility hindrance, as this indicates at which time the 'event' occurred.**

## Write to another backend

The following section describes the process to add another backend that is currently not supported in this demo.

1. Create a new typescript file in the folder `lib/database-clients` with a descriptive name `NewDatabase.ts`
2. Create a new class in the above typescript file that implements the interface `IDatabaseClient`
3. Extend the functions `getDbClient` and `getLdesOptions` in the [AppRunner class](./lib/AppRunner.ts)
   1. `getDbClient` → type represents the value that is passed in the config through `database.type`
   2. `getLdesOptions` → choose whether you want to receive the members as JSON objects or RDF quads (type is also passed in config through `database.type`)
4. In the `handleMember` function of the `IDatabaseClient` you can access the member data as follows:
   1. If you chose to get the members as objects, you can access the object as `member.object` (example in [Mongo class](./lib/database-clients/Mongo.ts))
   2. If you chose to get the members as RDF quads, you can access them as `member.quads` (example in [PostGIS class](./lib/database-clients//Postgis.ts))

5. Create a docker-compose file that spins up your backend (multiple examples available)
6. Modify the configuration file ([`config.json`](./config.json)) 
   1. Set database type
   2. Add the necessary credentials to connect to your database

7. There are two ways to start the script:
   1. Add the script as a service in the docker-compose. Example in [PostGIS docker-compose](./docker-compose-postgis.yml)
   2. CLI → `node bin/cli-runner.js` (if you are in the root)

8. That's it!