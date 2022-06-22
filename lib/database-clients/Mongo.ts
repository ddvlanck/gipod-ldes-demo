import { MongoClient } from "mongodb";
import { IDatabaseClient } from "../IDatabaseClient";

const DB_URL = `mongodb://admin:admin@localhost:27017`;

// Only hindrances that have a consequence that matches one of the list below are added to the database
const interestedConsequences = [
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/e4ea1344-aa27-40e8-b5af-94ec5f7956f8",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/8eda1611-902b-4c9a-8b3c-4c23a49d7c5d",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/3c9d3c6e-c5bf-477b-a102-d12654ce5ef0",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/6a71c816-511f-490c-9248-c68ded67ecd9",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/c53813ab-814f-4ff4-8a87-6934c72e175f",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/4981fd46-9536-415b-bd30-e53c0cedd799",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/6dd14722-79ad-4d25-aa0e-91e7fc53877b",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/23c9463a-c199-4db3-a8ce-40a088066cb3",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/cd1bbb8c-503f-4968-8483-01a4c2092d51",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/5f8ff25a-87c7-47c8-9332-35d4fabf4b07",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/7cbd0430-f6d4-4c74-8b8e-21b677e6b3d7",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/10c5101d-31fb-4909-a022-d76f868f7f50",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/ee31fd67-b75e-4499-9ad4-0a595717a9c7",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/5e5a1a0b-eaab-4b98-a5c8-6a4664cdb909",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/e52587c7-5566-4c1c-889c-7fcc947e4c4b",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/b922f580-68d3-471d-8712-8175417ad769",
  "api/v1/taxonomies/mobility-hindrance/consequencetypes/427bc6a6-619c-482d-934c-bda986df18d1"
];

export class Mongo implements IDatabaseClient {
  private static instance: Mongo;
  private readonly _client: MongoClient;

  private constructor() {
    this._client = new MongoClient(DB_URL);
  }

  public static getInstance(): Mongo {
    if (!Mongo.instance) {
      Mongo.instance = new Mongo();
    }

    return Mongo.instance;
  }

  private get client(): MongoClient {
    if (!this._client) {
      new Error('Trying to access mongo client before it was initialized.');
    }
    return this._client;
  }

  public async handleMember(member: any): Promise<void> {
    const mobilityHindrance = member.object;
    const entityId = mobilityHindrance.isVersionOf;
    const versionTimestamp = mobilityHindrance.createdOn;

    if (this.hindranceHasInterestingConsequence(mobilityHindrance)) {
      try {
        const db = this.client.db("ldes");
        const timestampCollection = db.collection("ldes_entity_timestamp");
        const filter = { _id: entityId };

        const previousTimestamp = (await timestampCollection.findOne(filter))?.timestamp;

        // Entity already exists in database, but we received an older version than the one that
        // is already in the database, so we skip this version.
        if (previousTimestamp && new Date(previousTimestamp).getTime() > new Date(versionTimestamp).getTime()) {
          return;
        }

        const updateOptions = {
          upsert: true,
        }

        // 1. Insert or update data
        const dataCollection = db.collection("ldes_data");

        const dataDoc = {
          '$set': {
            mobilityHindrance: mobilityHindrance,
          }
        }

        await dataCollection.updateOne(filter, dataDoc, updateOptions);

        // 2. Insert or update timestamp
        const timestampDoc = {
          '$set': {
            timestamp: versionTimestamp
          }
        }

        await timestampCollection.updateOne(filter, timestampDoc, updateOptions);
      } catch (error: unknown) {
        console.error(error);
        await this.client.close();
      }
    }
  }

  public async connect(): Promise<MongoClient> {
    return this.client.connect();
  }

  public async close(): Promise<void> {
    return this.client.close();
  }

  private hindranceHasInterestingConsequence(mobilityHindrance: any): boolean {
    if (mobilityHindrance.zone) {
      for (let z of mobilityHindrance.zone) {
        if (z.consequence) {
          const consequences = Array.isArray(z.consequence) ? z.consequence : [z.consequence];
          for (let con of consequences) {
            const containsConsequence = interestedConsequences.filter(x => con.id.indexOf(x) >= 0).length > 0;
            if (containsConsequence) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

}