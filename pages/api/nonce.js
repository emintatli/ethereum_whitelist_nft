import 'dotenv/config'
const sha256 = require("js-sha256");
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

const encryptLogin = (message) => {
    const salt = Date.now() * Math.random() * 1000;
    const salt2 = (Math.random() + 1).toString(36).substring(7);
    return sha256(salt + message + salt2);
  };

export default async function handler(req, res) {
  await init();
  const userWallet = req.body.wallet;
  const nonceKey = encryptLogin(
    userWallet + "nftProject" + Math.random() * 1000
  );
  try {
    const database = client.db("nftProject");
    const collection = database.collection("nftProject");
    const query = { wallet: userWallet };
    const user = await collection.findOne(query);
    if (user?._id) {
      res.send({ nonce: user.nonce });
    } else {
      const doc = {
        wallet: userWallet,
        nonce: nonceKey,
      };
      await collection.insertOne(doc);
      await client.close();
      res.send({ nonce: nonceKey });
    }
  } catch (err) {
    await client.close();
  }
}
