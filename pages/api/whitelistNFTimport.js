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
    if(req.body.nftcontract && req.body.secret){
      const database = client.db("nftProject");
      const collection = database.collection("admin");
      const query = { user: "admin" };
      const users = await collection.findOne(query);
      const adminWallet = users.wallet.toLowerCase();
      const query3 = { wallet: adminWallet };
      const collection3 = database.collection("nftProject");
      const users3 = await collection3.findOne(query3);

      if(users3.key == req.body.secret){
          const database = client.db("nftProject");
          const collection = database.collection("bannedCollectionIds");
          const doc = {
            collection:req.body.nftcontract,
            bannedIds:[],
          }
          await collection.insertOne(doc)
          await client.close();
           res.send({ status:"ok"});
        }

    }    
  } catch (err) {
    await client.close();
    res.send({ status:err});
      console.log(err)
  }
}
