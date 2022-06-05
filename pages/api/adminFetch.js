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
    const collection = database.collection("admin");
    const query = { user: "admin" };
    const users = await  collection.find(query).toArray();
    await client.close();
     res.send({ whitelist: users[0]?.wallet });
    
  } catch (err) {
      console.log(err)
  }
}
