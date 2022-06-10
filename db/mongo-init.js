// Create user
dbAdmin = db.getSiblingDB("admin");

dbAdmin.createUser({
  user: "ldesUser",
  pwd: "ldesPass",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }],
  mechanisms: ["SCRAM-SHA-1"],
});

// Authenticate user
dbAdmin.auth({
  user: "ldesUser",
  pwd: "ldesPass",
  mechanisms: ["SCRAM-SHA-1"],
  digestPassword: true,
});

// Create DB and collection
db = new Mongo().getDB("ldes");
db.createCollection("ldes_entity_timestamp", { capped: false });
db.createCollection("ldes_data", { capped: false });
