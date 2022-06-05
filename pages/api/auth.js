import 'dotenv/config'
const Web3 = require("web3");
const sha256 = require("js-sha256");
import { MongoClient } from "mongodb";
const rpcUrl = process.env.INFURA_RPC_URL; //ropsten
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
  const web3 = new Web3(rpcUrl);
  try {
    const database = client.db("nftProject");
    const collection = database.collection("nftProject");
    const _query = { wallet: req.body.wallet };
    const userF = await collection.findOne(_query);
    const authUser = web3.eth.accounts.recover(userF.nonce, req.body.sign);
    const authKey = encryptLogin(authUser);
    const nonceKey = encryptLogin(
      authUser + "nftProject" + Math.random() * 1000
    );

    const query = { wallet: authUser.toLowerCase()};
    const user = await collection.findOne(query);

    const updateDoc = {
      $set: {
        key: authKey,
        nonce: nonceKey,
      },
    };
    const filter = { key: user.key };
    await collection.updateOne(filter, updateDoc);

    const _user = await collection.findOne(query);
    await client.close();
    res.send({
      secret: _user.key,
      wallet: _user.wallet,
    });
  } catch (err) {
    await client.close();
    console.log(err);
  }
}
