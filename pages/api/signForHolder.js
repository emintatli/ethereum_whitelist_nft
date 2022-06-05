import 'dotenv/config'
import { MongoClient } from "mongodb";
const Web3 = require("web3");
const Moralis = require("moralis/node");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const devMode = true;
const uri = devMode
  ? process.env.MONGO_URI
  : "";
let client;
const privateKey =
  process.env.PRIVKEY_HOLDER;
const rpcUrl = process.env.INFURA_RPC_URL;
const publicMintAmount = 1;
let mintAllowed = true;

async function init() {
  client = new MongoClient(
    uri,
    { useUnifiedTopology: true },
    { useNewUrlParser: true },
    { connectTimeoutMS: 30000 },
    { keepAlive: 1 }
  );
  const serverUrl = "https://uqzfxdzd2t93.usemoralis.com:2053/server";
  const appId = "WzykwqCl1yWA31sXH18gzspEAd6NQ1ajQtZEHwff";
  Moralis.start({ serverUrl, appId });

  await client.connect();
}

export default async function handler(req, res) {
  await init();
  if (await checkWhitelisted(req, res)) {
    if (mintAllowed) {
      const signedData = await signMessage(req);
      res.send({
        status: "ok",
        sign: {
          signature: signedData.signature,
          messageHash: signedData.messageHash,
        },
      });
    }
  } else {
    if (await checkUserHaveNFT(req, res)) {
      await addWhitelisted(req, res);
    }
  }
}

const whitelistedCollections = async () => {
  const database = client.db("nftProject");
  const collection = database.collection("bannedCollectionIds");
  const user = await collection.find().toArray();
  return user;
};

const banNFTid = async (id, NFTcollection) => {
  try {
    const database = client.db("nftProject");
    const collection = database.collection("bannedCollectionIds");
    const query = { collection: NFTcollection };
    const user = await collection.findOne(query);

    const updateDoc = {
      $set: {
        bannedIds: [...user.bannedIds, id],
      },
    };
    await collection.updateOne(query, updateDoc);
  } catch (err) {
    console.log(err);
  }
};

const checkUserHaveNFT = async (req, res) => {
  try {
    const userSecret = req.body.secret;
    const database = client.db("nftProject");
    const collection = database.collection("nftProject");
    const query = { key: userSecret };
    const user = await collection.findOne(query);
    const options = { address: user.wallet, chain: "ropsten" };
    const NFTs = await Moralis.Web3.getNFTs(options);

    const whiteListedCollectionsAll = await whitelistedCollections();

    let pickFirstOne;
    for (let i = 0; i < whiteListedCollectionsAll.length; i++) {
      const new_NFTs = NFTs.filter(
        (v) =>
          Web3.utils.toChecksumAddress(v.token_address) ==
          Web3.utils.toChecksumAddress(whiteListedCollectionsAll[i].collection)
      );
      if (new_NFTs) {
        const bannedIds = whiteListedCollectionsAll[i].bannedIds;
        const filterBanned = new_NFTs.filter(
          (v) => !bannedIds.includes(v.token_id)
        );

        if (filterBanned) {
          pickFirstOne = filterBanned[0];
        }
      }
    }

    if (pickFirstOne) {
      await banNFTid(
        pickFirstOne.token_id,
        Web3.utils.toChecksumAddress(pickFirstOne.token_address)
      );
      return true;
    } else {
      res.send({ err: "You dont have a permit to mint an NFT." });
      return false;
    }
  } catch (err) {
    res.send({ ok: "ok" });
  }

  res.send({ ok: "ok" });
};

const checkWhitelisted = async (req, res) => {
  if (req.body.amount > 0 && req.body.secret) {
    try {
      const userSecret = req.body.secret;
      const amountToMint = req.body.amount;
      const database = client.db("nftProject");
      const collection = database.collection("nftProject");
      const query = { key: userSecret };
      const user = await collection.findOne(query);
      if (user) {
        const collection2 = database.collection("holderList");
        const query2 = { address: Web3.utils.toChecksumAddress(user.wallet) };
        const user2 = await collection2.findOne(query2);
        if (user2) {
          if (user2?.amount >= amountToMint) {
            const updateDoc = {
              $set: {
                amount: user2?.amount - amountToMint,
              },
            };
            await collection2.updateOne(query2, updateDoc);
            return true;
          } else {
            mintAllowed = false;
            res.send({ err: "no more mints allowed" });
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  } else {
    res.send({ err: "invalid parameters" });
  }
};
const addWhitelisted = async (req, res) => {
  if (req.body.secret) {
    try {
      const userSecret = req.body.secret;
      const database = client.db("nftProject");
      const collection = database.collection("nftProject");
      const query = { key: userSecret };
      const user = await collection.findOne(query);
      console.log(user);
      if (user) {
        const collection2 = database.collection("holderList");
        const doc = {
          address: Web3.utils.toChecksumAddress(user.wallet),
          amount: publicMintAmount,
        };
        await collection2.insertOne(doc);
        if (await checkWhitelisted(req, res)) {
          const signedData = await signMessage(req);
          res.send({
            status: "ok",
            sign: {
              signature: signedData.signature,
              messageHash: signedData.messageHash,
            },
          });
        }
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  } else {
    return false;
  }
};

async function signMessage() {
  const provider = new HDWalletProvider(privateKey, rpcUrl);
  const web3 = new Web3(provider);
  const signed = await web3.eth.accounts.sign(
    Math.random().toString(),
    privateKey
  );
  return { messageHash: signed.messageHash, signature: signed.signature };
}
