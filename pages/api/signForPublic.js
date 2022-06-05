import 'dotenv/config'
import { MongoClient } from "mongodb";
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const devMode=true;
const uri = devMode ? process.env.MONGO_URI : "";
let client;
const privateKey=process.env.PRIVKEY_PUBLIC;
const rpcUrl=process.env.INFURA_RPC_URL;
const publicMintAmount=4;
let mintAllowed=true;
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
    if(await checkWhitelisted(req,res)){
        if(mintAllowed){
            const signedData=await signMessage(req);
            res.send({ status: "ok",sign:{
                signature:signedData.signature,
                messageHash:signedData.messageHash
            } });
        }
       
    }   
    else{
    await addWhitelisted(req,res);


    }
  
  


  
}



const checkWhitelisted=async(req,res)=>{
    if(req.body.amount>0 && req.body.secret){
        try {
            const userSecret=req.body.secret;
            const amountToMint=req.body.amount;
            const database = client.db("nftProject");
            const collection = database.collection("nftProject");
            const query = { key: userSecret };
            const user = await collection.findOne(query);
            if(user){
                const collection2 = database.collection("publicList");
                const query2 = { address:Web3.utils.toChecksumAddress(user.wallet) };
                const user2 = await collection2.findOne(query2);
                if(user2){
                    if(user2?.amount>=amountToMint){
                    
                        const updateDoc = {
                            $set: {
                                amount: user2?.amount-amountToMint
                            },
                          };
                         await collection2.updateOne(query2,updateDoc);
                        return true;
                        
        
                    }
                    else{
                        mintAllowed=false;
                        res.send({err:"no more mints allowed"});
                        return true;
                    }
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
        res.send({err:"invalid parameters"});
    }

}
const addWhitelisted=async(req,res)=>{
    if(req.body.secret){
        try {
            const userSecret=req.body.secret;
            const database = client.db("nftProject");
            const collection = database.collection("nftProject");
            const query = { key: userSecret };
            const user = await collection.findOne(query);
            console.log(user)
            if(user){
                const collection2 = database.collection("publicList");
                const doc={
                    address:Web3.utils.toChecksumAddress(user.wallet),
                    amount:publicMintAmount
                }
              await collection2.insertOne(doc);
             if(await checkWhitelisted(req,res)){
                const signedData=await signMessage(req);
                res.send({ status: "ok",sign:{
                    signature:signedData.signature,
                    messageHash:signedData.messageHash
                } });
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
