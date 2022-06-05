import 'dotenv/config'
import { MongoClient } from "mongodb";
let client;
const devMode = true;

async function init() {
  const uri = devMode
    ? process.env.MONGO_URI
    : "";
  client = new MongoClient(
    uri,
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    { connectTimeoutMS: 30000 },
    { keepAlive: 1 }
  );
  await client.connect();
}


export default async function handler(req, res) {
  await init();
  try {
    const database = client.db("nftProject");
    const collection = database.collection("nftProjectWhitelist");
    const query = { whitelisted: true };
    const users = await  collection.find(query).toArray();
    const collection2 = database.collection("bannedCollectionIds");
    const query2 = {};
    const users2 = await  collection2.find(query2).toArray();
    await client.close();
     res.send({ whitelist: users ,collectionwl:users2});
    
  } catch (err) {
    await client.close();
      console.log(err)
  }
}
