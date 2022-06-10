export const gipodContext = [{
  "@base": "https://private-api.gipod.beta-vlaanderen.be",
  "id": "@id",
  "value": "@value",
  "type": "@type",
  "@language": "nl-BE",
  "xsd": "http://www.w3.org/2001/XMLSchema#",
  "dct": "http://purl.org/dc/terms/",
  "dc": "http://purl.org/dc/elements/1.1",
  "PublicDomainOccupancy": "https://data.vlaanderen.be/ns/mobiliteit#Inname",
  "Groundwork": "https://data.vlaanderen.be/ns/mobiliteit#Grondwerk",
  "Work": "https://data.vlaanderen.be/ns/mobiliteit#Werk",
  "Event": "https://data.vlaanderen.be/ns/mobiliteit#Evenement",
  "MobilityHindrance": "https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitshinder",
  "SignalingPermit": "https://data.vlaanderen.be/ns/mobiliteit#Signalisatievergunning",
  "TrenchSynergyRequest": "https://data.vlaanderen.be/ns/mobiliteit#Synergieaanvraag",
  "TrenchSynergy": "https://data.vlaanderen.be/ns/mobiliteit#Synergie",
  "Organisation": "http://www.w3.org/ns/org#Organization",
  "Identifier": "http://www.w3.org/ns/adms#Identifier",
  "ContactOrganisationInRole": "http://www.w3.org/ns/org#Organization",
  "ContactInfoPublic": "https://data.vlaanderen.be/ns/mobiliteit#ContactinfoPubliek",
  "AddressRepresentation": "http://www.w3.org/ns/locn#Address",
  "Geometry": "http://www.w3.org/ns/locn#Geometry",
  "Period": "http://data.europa.eu/m8g/PeriodOfTime",
  "PeriodWithDuration": "https://data.vlaanderen.be/ns/mobiliteit#PeriodeMetDuur",
  "TimeSchedule": "https://schema.org/Schedule",
  "Zone": "https://data.vlaanderen.be/ns/mobiliteit#Zone",
  "identifier": {
    "@id": "http://www.w3.org/ns/adms#identifier",
    "@type": "@id",
    "@container": "@set"
  },
  "Identifier.identifier": {
    "@id": "http://www.w3.org/2004/02/skos/core#notation"
  },
  "assignedByName": {
    "@id": "http://www.w3.org/ns/adms#schemaAgency"
  },
  "address": {
    "@id": "http://www.w3.org/ns/locn#address",
    "@type": "@id"
  },
  "isPublic": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Inname.openbaarDomein"
  },
  "owner": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#beheerder",
    "@type": "@id"
  },
  "description": {
    "@id": "http://purl.org/dc/terms/description",
    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
  },
  "duration": {
    "@id": "https://data.vlaanderen.be/ns/generiek#Tijdsschema.duur",
    "@type": "xsd:duration"
  },
  "contactname": {
    "@id": "http://xmlns.com/foaf/0.1/name"
  },
  "contactOrganisation": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#contactOrganisatie",
    "@type": "@id",
    "@container": "@set"
  },
  "telephone": {
    "@id": "http://schema.org/telephone",
    "@type": "xsd:string",
    "@container": "@set"
  },
  "preferredName": {
    "@id": "http://www.w3.org/2004/02/skos/core#prefLabel",
    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
  },
  "category": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Grondwerk.categorie",
    "@type": "@id"
  },
  "specification": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#specificatie",
    "@type": "@id"
  },
  "isRelocationGroundwork": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Grondwerk.verplaatsingswerk",
    "@type": "xsd:boolean"
  },
  "causingGroundwork": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#heeftOorzaakGrondwerk",
    "@type": "@id",
    "@container": "@set"
  },
  "period": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#periode",
    "@type": "@id",
    "@container": "@set"
  },
  "start": {
    "@id": "http://data.europa.eu/m8g/startTime",
    "@type": "xsd:dateTime"
  },
  "end": {
    "@id": "http://data.europa.eu/m8g/endTime",
    "@type": "xsd:dateTime"
  },
  "periodDuration": {
    "@id": "http://schema.org/duration",
    "@type": "xsd:duration"
  },
  "timeSchedule": {
    "@id": "http://schema.org/eventSchedule",
    "@type": "@id",
    "@container": "@set"
  },
  "startDate": {
    "@id": "http://schema.org/startDate",
    "@type": "xsd:date"
  },
  "startTime": {
    "@id": "http://schema.org/startTime",
    "@type": "xsd:time"
  },
  "endDate": {
    "@id": "http://schema.org/endDate",
    "@type": "xsd:date"
  },
  "endTime": {
    "@id": "http://schema.org/endTime",
    "@type": "xsd:time"
  },
  "consequence": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#gevolg",
    "@type": "@id"
  },
  "status": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Inname.status",
    "@type": "@id"
  },
  "publicDomainOccupancyType": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Inname.type",
    "@type": "@id",
    "@container": "@set"
  },
  "hasConsequence": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Inname.heeftGevolg",
    "@type": "@id"
  },
  "estimatedDuration": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#geschatteDuur",
    "@type": "xsd:duration"
  },
  "zoneType": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#Zone.type",
    "@type": "@id",
    "@container": "@set"
  },
  "byDay": {
    "@id": "http://schema.org/byDay",
    "@type": "xsd:string"
  },
  "byMonth": {
    "@id": "http://schema.org/byMonth",
    "@type": "xsd:integer"
  },
  "byMonthDay": {
    "@id": "http://schema.org/byMonthDay",
    "@type": "xsd:integer",
    "@container": "@set"
  },
  "repeatCount": {
    "@id": "http://schema.org/repeatCount",
    "@type": "xsd:integer"
  },
  "repeatFrequency": {
    "@id": "http://schema.org/repeatFrequency"
  },
  "exceptDate": {
    "@id": "http://schema.org/exceptDate",
    "@type": "xsd:date",
    "@container": "@set"
  },
  "bySetPos": {
    "@id": "https://data.vlaanderen.be/ns/generiek#perSetpositie",
    "@type": "xsd:integer",
    "@container": "@set"
  },
  "geometry": {
    "@id": "http://www.w3.org/ns/locn#geometry",
    "@type": "@id"
  },
  "gipodId": {
    "@id": "https://gipod.vlaanderen.be/ns/gipod#gipodId"
  },
  "isConsequenceOf": {
    "@reverse": "https://data.vlaanderen.be/ns/mobiliteit#Inname.heeftGevolg",
    "@type": "@id"
  },
  "permittedBy": {
    "@id": "https://gipod.vlaanderen.be/ns/gipod#isVergundDoor",
    "@type": "@id"
  },
  "prefLabel": {
    "@id": "http://www.w3.org/2004/02/skos/core#prefLabel"
  },
  "reference": {
    "@id": "https://gipod.vlaanderen.be/ns/gipod#reference",
    "@type": "xsd:string"
  },
  "remark": {
    "@id": "https://gipod.vlaanderen.be/ns/gipod#remark",
    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
  },
  "addressRepresentation": {
    "@id": "https://www.w3.org/ns/locn#address",
    "@type": "@id"
  },
  "wkt": {
    "@id": "http://www.opengis.net/ont/geosparql#asWKT",
    "@type": "http://www.opengis.net/ont/geosparql#wktLiteral"
  },
  "zone": {
    "@id": "https://data.vlaanderen.be/ns/mobiliteit#zone",
    "@type": "@id",
    "@container": "@set"
  },
  "lastModifiedOn": {
    "@id": "dct:modified",
    "@type": "xsd:dateTime"
  },
  "lastModifiedBy": {
    "@id": "http://purl.org/dc/elements/1.1/contributor",
    "@type": "@id"
  },
  "createdOn": {
    "@id": "dct:created",
    "@type": "xsd:dateTime"
  },
  "createdBy": {
    "@id": "http://purl.org/dc/elements/1.1/creator",
    "@type": "@id"
  }
},
{
  "adms": "http://www.w3.org/ns/adms#",
  "prov": "http://www.w3.org/ns/prov#",
  "ldes": "https://w3id.org/ldes#",
  "tree": "https://w3id.org/tree#",
  "eventName": "adms:versionNotes",
  "EventStream": "ldes:EventStream",
  "Node": "tree:Node",
  "view": "tree:view",
  "viewOf": {
    "@reverse": "view",
    "@type": "@id"
  },
  "member": "tree:member",
  "relation": "tree:relation",
  "memberOf": {
    "@reverse": "member",
    "@type": "@id"
  },
  "timestampPath": {
    "@id": "ldes:timestampPath",
    "@type": "@id"
  },
  "versionOfPath": {
    "@id": "ldes:versionOfPath",
    "@type": "@id"
  },
  "shape": {
    "@id": "tree:shape",
    "@type": "@id"
  },
  "tree:node": {
    "@type": "@id",
  },
  "tree:path": {
    "@type": "@id",
  },
  "tree:value": {
    "@type": "xsd:dateTime",
  },
  "generatedAtTime": {
    "@id": "prov:generatedAtTime",
    "@type": "xsd:dateTime",
  },
  "isVersionOf": {
    "@id": "dct:isVersionOf",
    "@type": "@id",
  },
  "items": "@included",
  "collectionInfo": "@included",
}]