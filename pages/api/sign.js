import 'dotenv/config'
import { MongoClient } from "mongodb";
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const devMode=true;
const uri = devMode ? process.env.MONGO_URI : "";
let client;
const privateKey=process.env.PRIVKEY_SIGN;
const rpcUrl=process.env.INFURA_RPC_URL
async function init() {
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
    if(await checkWhitelisted(req)){
        const signedData=await signMessage(req);
        await client.close();
        res.send({ status: "ok",sign:{
            signature:signedData.signature,
            messageHash:signedData.messageHash
        } });
    }   
    else{
        await client.close();
        res.send({ status: "Error" });
    }
  
  


  
}



const checkWhitelisted=async(req)=>{
    if(req.body.amount>0 && req.body.secret){
        try {
            const userSecret=req.body.secret;
            const amountToMint=req.body.amount;
            const database = client.db("nftProject");
            const collection = database.collection("nftProject");
            const query = { key: userSecret };
            const user = await collection.findOne(query);
            if(user){
                const collection2 = database.collection("nftProjectWhitelist");
                const query2 = { address:Web3.utils.toChecksumAddress(user.wallet) };
                const user2 = await collection2.findOne(query2);
                if(user2?.whitelisted && user2?.amount>=amountToMint){
                    
                    const updateDoc = {
                        $set: {
                            amount: user2?.amount-amountToMint
                        },
                      };
                     await collection2.updateOne(query2,updateDoc);
                    return true;
                    
    
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
            
            
          } catch (err) {
              console.log(err)
              return false;
          }
    }
    else {
        return false;
    }

}


async function signMessage() {
    

    const provider = new HDWalletProvider(privateKey, rpcUrl);
    const web3= new Web3(provider);
    const signed=await web3.eth.accounts.sign((Math.random().toString()), privateKey);
    return {messageHash:signed.messageHash,signature:signed.signature };
  
  } 
