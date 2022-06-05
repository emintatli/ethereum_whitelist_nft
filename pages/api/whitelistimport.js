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
    if (req.body.secret && req.body.whitelistAddressList) {
      const database = client.db("nftProject");
      const WList=req.body.whitelistAddressList;
      const collection = database.collection("admin");
      const query = { user: "admin" };
      const users = await collection.findOne(query);
      const adminWallet = users.wallet.toLowerCase();
      const query3 = { wallet: adminWallet };
      const collection3 = database.collection("nftProject");
      const users3 = await collection3.findOne(query3);
      if (users3.key == req.body.secret) {
        const collection2 = database.collection("nftProjectWhitelist");
       const splitted=WList.split("\r\n").map(v=>v.split(","));
        let docs = [];
    for (let i=0;i<splitted.length;i++){
       docs.push({
        address:splitted[i][0],
        whitelisted:true,
        amount:splitted[i][1]
       })
    }
    const options = { ordered: true };

    

    await collection2.insertMany(docs, options);
        await client.close();
        res.send({ status: "updated" });
      } else {
        res.send({ err: "unauthorized" });
      }
    }
  } catch (err) {
    res.send({ err: "error" });
    await client.close();
    console.log(err);
  }
}
