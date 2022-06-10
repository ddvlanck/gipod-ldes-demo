# GIPOD LDES Demo

This demo uses the LDES client and replicates the GIPOD mobility hindrance LDES to a MongoDB database.

## Usage

### 1. Init the database

The database can be initialised by running the `docker-compose.yml` file with the following command:
```bash
> docker-compose up
```

The docker-compose file will start two containers → `mongo` and `mongo-express`. The first container `mongo` contains a MongoDB database. The latter container provides a Web-based admin interface that can be used to interact with the MongoDB database.

The init script will create a new database called `ldes` with two collections in it:
- `ldes_entity_timestamp` → contains the entity URIs along with the timestamp of the most recent version
- `ldes_data` → contains the mobility hindrances

#### Troubleshooting

It is possible that upon the first run, the `mongo-express` container fails to run. This is because `mongo-express` tries to connect to the MongoDB database in the `mongo` container, and it is not fully initialized yet.

When this issue occurs, just restart the `mongo-express` container:
```bash
> docker start mongo-express
``` 

### 2. Running the script

The code is written in Typescript and must be compiled to Javascript in order to execute it:
```bash
> npm run build
```

When the code is compiled to Javascript, navigate to the `bin` folder and execute the following command:
```bash
> node runner.js
```

#### What the script does

The script will create a database and LDES client. If the LDES client has had a previous run, the previous state will be imported into the current LDES client, so that it does not start iterating the LDES from the beginning, but from the point where it previously stopped.

**For this demo, we simulate that we only want the latest version of every object.**

For every member we receive from the LDES client, we execute the `handleMember` function.
In the `handleMember` function, we check if the mobility hindrance has a consequence in which we are interested. The list of consequences that are used to filter can be found in the [Mongo class](./lib/Mongo.ts).

For every entity that is added to the database, we store the timestamp of its latest version in the `ldes_entity_timestamp` collection. So, for every version of an entity that we receive, we query the timestamp collection to check if the timestamp of the received version is more recent than the one already in the database. If that is the case, the means the version that we received is more recent than the one in the database. So, then we update the `ldes_data` collection with the newest version for the entity, and we also update to `ldes_entity_timestamp` collection with the timestamp of the newest version.

**As timestamp, we use the `createdOn` field of a mobility hindrance, as this indicates at which time the 'event' occurred.**
