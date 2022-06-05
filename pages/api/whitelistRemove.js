import 'dotenv/config'
import { MongoClient } from "mongodb";
var ObjectId = require("mongodb").ObjectId;
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
    if (req.body.id && req.body.secret) {
      const database = client.db("nftProject");
      const collection = database.collection("admin");
      const query = { user: "admin" };
      const users = await collection.findOne(query);
      const adminWallet = users.wallet.toLowerCase();
      const query3 = { wallet: adminWallet };
      const collection3 = database.collection("nftProject");
      const users3 = await collection3.findOne(query3);
      if (users3.key == req.body.secret) {
        const idE = req.body.id;
        const collection2 = database.collection("nftProjectWhitelist");
        const o_id = new ObjectId(idE);
        const query = { _id: o_id };

        await collection2.deleteOne(query);
        await client.close();
        res.send({ status: "updated" });
      } else {
        res.send({ err: "unauthorized" });
      }
    }
  } catch (err) {
    await client.close();
    console.log(err);
  }
}
