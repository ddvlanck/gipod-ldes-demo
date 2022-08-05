import { Pool, PoolClient } from "pg"
import { IDatabaseClient } from "../IDatabaseClient";
import type * as RDF from '@rdfjs/types';
import { DataFactory } from "rdf-data-factory";

export class Postgis implements IDatabaseClient {
  private static instance: Postgis;
  private readonly _pool: Pool;
  public df: DataFactory;

  private constructor() {
    this._pool = new Pool({
      user: 'ldes',
      password: 'ldes',
      host: 'localhost',
      port: 5432,
      database: 'mobility_hindrance'
    })

    this._pool.on('error', (err) => {
      console.error(err);
    })

    this.df = new DataFactory();
  }

  private get pool(): Pool {
    if (!this._pool) {
      throw new Error(`Trying to access Postgis db before client was ready.`);
    }
    return this._pool;
  }

  public async provision(): Promise<void> {
    await this.pool.connect();
  }

  public async close(): Promise<void> {
    // Currently, no implementation needed
  }

  public static getInstance(): Postgis {
    if (!Postgis.instance) {
      Postgis.instance = new Postgis();
    }
    return Postgis.instance;
  }

  public async handleMember(member: any): Promise<void> {
    const versionId = member.id.value;
    const quads: RDF.Quad[] = member.quads;

    const gipodId = quads.find(x => x.predicate.equals(this.df.namedNode('https://gipod.vlaanderen.be/ns/gipod#gipodId')))?.object.value;

    if (!gipodId) {
      console.log(`Member ${versionId} has no value for gipodId and will not be added to the database`);
      return;
    }

    const identifierAssignedByName = quads.find(x => x.predicate.equals(this.df.namedNode('http://www.w3.org/ns/adms#schemaAgency')))?.object.value;
    const description = quads.find(x => x.predicate.equals(this.df.namedNode('http://purl.org/dc/terms/description')))?.object.value;

    const ownerObject = quads.find(x => x.predicate.equals(this.df.namedNode('https://data.vlaanderen.be/ns/mobiliteit#beheerder')))?.object;
    const ownerId = quads.find(x => x.subject.equals(ownerObject) && x.predicate.equals(this.df.namedNode('http://purl.org/dc/terms/isVersionOf')))?.object.value;
    const ownerPrefLabel = quads.find(x => x.subject.equals(ownerObject) && x.predicate.equals(this.df.namedNode('http://www.w3.org/2004/02/skos/core#prefLabel')))?.object.value;

    const zoneId = quads.find(x =>
      x.predicate.equals(this.df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')) &&
      x.object.equals(this.df.namedNode('https://data.vlaanderen.be/ns/mobiliteit#Zone'))
    )?.subject.value;

    const consequenceObjects = quads.filter(x => x.predicate.equals(this.df.namedNode('https://data.vlaanderen.be/ns/mobiliteit#gevolg'))).map(x => x.object);
    const consequences: any[] = [];
    const consequenceLabels: string[] = [];

    if (consequenceObjects.length > 0) {
      consequenceObjects.forEach(object => {
        const prefLabel = quads.find(x => x.subject.equals(object) && x.predicate.equals(this.df.namedNode('http://www.w3.org/2004/02/skos/core#prefLabel')));
        consequences.push({
          '@id': object.value,
          prefLabel: prefLabel?.object.value,
        });

        if (prefLabel) {
          consequenceLabels.push(prefLabel.object.value);
        }
      });
    }

    let wkt = quads.find(x => x.predicate.equals(this.df.namedNode('http://www.opengis.net/ont/geosparql#asWKT')))?.object.value;

    if (!wkt) {
      console.log(`Member ${versionId} has no geometry and will not be added to the database`);
      return;
    }

    // Remove CRS (assuming it is always <http://www.opengis.net/def/crs/EPSG/9.9.1/31370>)
    wkt = wkt.replace('<http://www.opengis.net/def/crs/EPSG/9.9.1/31370>', '').trim();

    const zoneType = quads.find(x => x.predicate.equals(this.df.namedNode('https://data.vlaanderen.be/ns/mobiliteit#Zone.type')))?.object.value;

    const periodStart = quads.find(x => x.predicate.equals(this.df.namedNode('http://data.europa.eu/m8g/startTime')))?.object.value;
    const periodEnd = quads.find(x => x.predicate.equals(this.df.namedNode('http://data.europa.eu/m8g/endTime')))?.object.value;

    const timeScheduleStart = quads.find(x => x.predicate.equals(this.df.namedNode('http://schema.org/startDate')))?.object.value;
    const timeScheduleEnd = quads.find(x => x.predicate.equals(this.df.namedNode('http://schema.org/startDate')))?.object.value;
    const timeScheduleRepeatFrequency = quads.find(x => x.predicate.equals(this.df.namedNode('http://schema.org/repeatFrequency')))?.object.value;
    const timeScheduleStartTime = quads.find(x => x.predicate.equals(this.df.namedNode('http://schema.org/startTime')))?.object.value;
    const timeScheduleEndTime = quads.find(x => x.predicate.equals(this.df.namedNode('http://schema.org/endTime')))?.object.value;
    const timeScheduleByDay = quads.filter(x => x.predicate.equals(this.df.namedNode('http://schema.org/byDay'))).map(x => x.object.value);
    const timeScheduleByMonth = quads.filter(x => x.predicate.equals(this.df.namedNode('http://schema.org/byMonth')))?.map(x => parseInt(x.object.value));
    const timeScheduleByMonthDay = quads.filter(x => x.predicate.equals(this.df.namedNode('http://schema.org/byMonthDay')))?.map(x => parseInt(x.object.value));

    const statusId = quads.find(x => x.predicate.equals(this.df.namedNode('https://data.vlaanderen.be/ns/mobiliteit#Inname.status')))?.object;
    let statusLabel;

    if (statusId) {
      statusLabel = quads.find(x => x.subject.equals(statusId) && x.predicate.equals(this.df.namedNode('http://www.w3.org/2004/02/skos/core#prefLabel')))?.object.value;
    }

    const generatedAtTime = quads.find(x => x.predicate.equals(this.df.namedNode('http://www.w3.org/ns/prov#generatedAtTime')))?.object.value;
    const eventName = quads.find(x => x.predicate.equals(this.df.namedNode('http://www.w3.org/ns/adms#versionNotes')))?.object.value;
    const entityId = quads.find(x => x.subject.equals(this.df.namedNode(versionId)) && x.predicate.equals(this.df.namedNode('http://purl.org/dc/terms/isVersionOf')))?.object.value;

    if (!entityId) {
      console.log(`Member ${versionId} has no entity id and will not be added to the database.`);
      return;
    }

    const createdOn = quads.find(x => x.predicate.equals(this.df.namedNode('http://purl.org/dc/terms/created')))?.object.value;

    if (!createdOn) {
      console.log(`Member ${versionId} has not createdOn timestamp and will not be added to the database.`);
      return;
    }

    if (await this.versionCanBeAdded(entityId, createdOn)) {
      await this.addMobilityHindrance(
        versionId,
        parseInt(gipodId),
        identifierAssignedByName,
        description,
        ownerId,
        ownerPrefLabel,
        zoneId,
        JSON.stringify(consequences),
        consequenceLabels,
        wkt,
        zoneType,
        periodStart,
        periodEnd,
        statusLabel,
        generatedAtTime,
        eventName,
        entityId,
        createdOn,
        timeScheduleStart,
        timeScheduleEnd,
        timeScheduleRepeatFrequency,
        timeScheduleStartTime,
        timeScheduleEndTime,
        timeScheduleByDay,
        timeScheduleByMonth,
        timeScheduleByMonthDay
      );

      await this.updateVersionMetadata(entityId, createdOn);
    }
  }

  private async versionCanBeAdded(entityId: string, createdOn: string): Promise<boolean> {
    const client = await this.pool.connect();
    let versionCanBeAdded = false;


    try {
      const result = await client.query('SELECT timestamp from ldes.version_metadata where entity_id = $1', [entityId]);

      if (result.rowCount === 0) {
        versionCanBeAdded = true;
      }

      if (result.rowCount > 0) {
        const currentTimestamp = new Date(result.rows[0].timstamp);
        const newTimestamp = new Date(createdOn);

        if (currentTimestamp < newTimestamp) {
          versionCanBeAdded = true;
        }
      }
    } catch (err: unknown) {
      console.log(`Error while querying version meta data.`);
      console.error(err);
    } finally {
      client.release();
      return versionCanBeAdded;
    }
  }

  private async updateVersionMetadata(entityId: string, createdOn: string): Promise<void> {
    const client = await this.pool.connect();
    const UPSERT = `
      INSERT INTO ldes.version_metadata (entity_id, timestamp)
      VALUES($1,$2) 
      ON CONFLICT (entity_id) 
      DO 
        UPDATE SET timestamp = EXCLUDED.timestamp`;

    await client.query(UPSERT, [entityId, createdOn]).then(() => client.release());
  }

  private async addMobilityHindrance(
    versionId: string,
    gipodId: number,
    identifierAssignedByName: string | undefined,
    description: string | undefined,
    ownerIsVersionOf: string | undefined,
    ownerPreferredName: string | undefined,
    zoneId: string | undefined,
    zoneConsequence: string | undefined,
    zoneConsequenceLabel: string[],
    zoneWkt: string | undefined,
    zoneType: string | undefined,
    periodStart: string | undefined,
    periodEnd: string | undefined,
    status: string | undefined,
    generatedAtTime: string | undefined,
    eventName: string | undefined,
    entityId: string,
    createdOn: string,
    timeScheduleStart: string | undefined,
    timeScheduleEnd: string | undefined,
    timeScheduleRepeatFrequency: string | undefined,
    timeScheduleStartTime: string | undefined,
    timeScheduleEndTime: string | undefined,
    timeScheduleByDay: string[],
    timeScheduleByMonth: number[],
    timeScheduleByMonthDay: number[]
  ): Promise<any> {
    const client = await this.pool.connect();
    const ADD_MOBILITY_HINDRANCE = `
      INSERT INTO ldes.mobility_hindrances (
        "version_id",
        "gipod_id",
        "identifier_assigned_by_name",
        "description",
        "owner_is_version_of",
        "owner_preferred_name",
        "zone_id",
        "zone_consequence",
        "zone_consequence_label",
        "zone_geometry_wkt",
        "zone_type",
        "period_start",
        "period_end",
        "status",
        "generated_at_time",
        "last_event_name",
        "entity_id",
        "created_on",
        "time_schedule_start_date",
        "time_schedule_end_date",
        "time_schedule_repeat_frequency",
        "time_schedule_start_time",
        "time_schedule_end_time",
        "time_schedule_by_day",
        "time_schedule_by_month",
        "time_schedule_by_month_day")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,ST_GeomFromText($10),$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
      ON CONFLICT (entity_id)
      DO UPDATE SET
        version_id = EXCLUDED.version_id,
        gipod_id = EXCLUDED.gipod_id,
        identifier_assigned_by_name = EXCLUDED.identifier_assigned_by_name,
        description = EXCLUDED.description,
        owner_is_version_of = EXCLUDED.owner_is_version_of,
        owner_preferred_name = EXCLUDED.owner_preferred_name,
        zone_id = EXCLUDED.zone_id,
        zone_consequence = EXCLUDED.zone_consequence,
        zone_consequence_label = EXCLUDED.zone_consequence_label,
        zone_type = EXCLUDED.zone_type,
        period_start = EXCLUDED.period_start,
        period_end = EXCLUDED.period_end,
        status = EXCLUDED.status,
        generated_at_time = EXCLUDED.generated_at_time,
        last_event_name = EXCLUDED.last_event_name,
        created_on = EXCLUDED.created_on,
        time_schedule_start_date = EXCLUDED.time_schedule_start_date,
        time_schedule_end_date = EXCLUDED.time_schedule_end_date,
        time_schedule_repeat_frequency = EXCLUDED.time_schedule_repeat_frequency,
        time_schedule_start_time = EXCLUDED.time_schedule_start_time,
        time_schedule_end_time = EXCLUDED.time_schedule_end_time,
        time_schedule_by_day = EXCLUDED.time_schedule_by_day,
        time_schedule_by_month = EXCLUDED.time_schedule_by_month,
        time_schedule_by_month_day = EXCLUDED.time_schedule_by_month_day`;

    try {
      await client.query(
        ADD_MOBILITY_HINDRANCE,
        [
          versionId,
          gipodId,
          identifierAssignedByName,
          description,
          ownerIsVersionOf,
          ownerPreferredName,
          zoneId,
          zoneConsequence,
          zoneConsequenceLabel,
          zoneWkt,
          zoneType,
          periodStart,
          periodEnd,
          status,
          generatedAtTime,
          eventName,
          entityId,
          createdOn,
          timeScheduleStart,
          timeScheduleEnd,
          timeScheduleRepeatFrequency,
          timeScheduleStartTime,
          timeScheduleEndTime,
          timeScheduleByDay,
          timeScheduleByMonth,
          timeScheduleByMonthDay,
        ]
      );
    } catch (err: unknown) {
      console.log(`Unnable to add ${versionId} to the database.`);
      console.error(err);
    } finally {
      client.release();
    }
  }
} 