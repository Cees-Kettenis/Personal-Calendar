const { getDatabase } = require("./mongo");
const ObjectId = require("mongodb").ObjectId;

const collectionName = "Event";

async function InsertEvent(Event) {
  const database = await getDatabase();
  const { insertedId } = await database.collection(collectionName).insertOne(Event);
  return insertedId;
}

async function GetEvents() {
  const database = await getDatabase();
  return await database.collection(collectionName).find({}).toArray();
}

async function DeleteEvent(id) {
  const database = await getDatabase();
  await database.collection(collectionName).deleteOne({
    _id: new ObjectId(id),
  });
}

async function UpdateEvent(id, Event) {
  const database = await getDatabase();
  delete Event._id;
  await database.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...Event,
      },
    }
  );
}
module.exports = {
  InsertEvent,
  GetEvents,
  UpdateEvent,
  DeleteEvent,
};
