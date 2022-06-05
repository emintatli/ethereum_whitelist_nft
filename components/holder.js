import { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Holder(props) {
  const [amountToMint, setAmount] = useState(1);
  const [nftDetails,setNFT]=useState();
  const [left,setLeft]=useState();
  const [loading,setLoading]=useState(false);
  const contractAddress="0xbb35a87Bc8865e6cCC8A5ECe4E7a562F0936F955";
  const rpcUrl=process.env.INFURA_RPC_URL
  const nftPrice="0.01"

  useEffect(async()=>{
	setLeft(props.left);
	await getContractDetails();
  },[])

  const getContractDetails=async()=>{
	 const minAbi=[ {
		"inputs": [],
		"name": "maxMint",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	  },
	  {
		"inputs": [],
		"name": "totalMint",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	  }]
	  const web3 = new Web3(rpcUrl);
	  const contract = new web3.eth.Contract(minAbi,contractAddress);
	  const totalMint=await contract.methods.totalMint().call();
	  const maxMint=await contract.methods.maxMint().call();
	  setNFT({
		totalMint,
		maxMint
	  })
  }

  const wlmintHandler = async () => {
	setLoading(true);
    const req = await fetch("/api/signForHolder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: props.user.secret,
        amount: amountToMint,
      }),
    });
    const data = await req.json();
    if(data?.status=="ok"){
		const accounts=await window.ethereum.request({ method: 'eth_requestAccounts' });
		const minAbi=[ {
      "inputs": [
        { "internalType": "address", "name": "player", "type": "address" },
        { "internalType": "bytes32", "name": "message", "type": "bytes32" },
        { "internalType": "bytes", "name": "sig", "type": "bytes" }
      ],
      "name": "awardItemHolder",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }]
		  const provider=window.ethereum;
		  const userWallet=accounts[0];
		  const web3 = new Web3(provider);
   		  const contract = new web3.eth.Contract(minAbi,contractAddress);
		  const tx=await contract.methods.awardItemHolder(userWallet,data.sign.messageHash,data.sign.signature).send({from:userWallet,value:"0"});
		  if(tx){
			toast.success('NFT minted successfully.', {
				position: "bottom-right",
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				autoClose:false
				});
				setLeft(left-amountToMint);
				await getContractDetails();
				setLoading(false);
				
		  }
		  else{
			toast.error('Someting went wrong!', {
				position: "bottom-right",
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				autoClose:false
				});
				setLoading(false);
		  }
		

	}
  else{
    toast.error(data.err, {
      position: "bottom-right",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      autoClose:false
      });
  }
	setLoading(false);
  };

  return (
    <>
	<ToastContainer/>
      <div className="container-fluid main-screen">
        <div className="container">
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-6 text-center">
              <h2>{left} AVILABILE</h2>
              <a className="btn main-btn mint">{nftDetails?.totalMint}/{nftDetails?.maxMint}</a>
              <div className="input-group">
                <input
                  onClick={() => {
                    amountToMint > 1 && setAmount(amountToMint - 1);
                  }}
                  type="button"
                  value="-"
                  className="button-minus"
                  data-field="quantity"
                />

                <input
                  type="number"
                  step="1"
                  max=""
                  value={amountToMint}
                  name="quantity"
                  className="quantity-field"
                />
                <input
                  onClick={() => {
                    props.left > amountToMint && setAmount(amountToMint + 1);
                  }}
                  type="button"
                  value="+"
                  className="button-plus"
                  data-field="quantity"
                />
              </div>
              <button disabled={left<1} onClick={wlmintHandler} href="#" className="btn main-btn mint">
               {loading?<img width={30} src="/roll.svg"/>:"MINT"} 
              </button>
              <h3>Price : Free (+ Gas fees)</h3>
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
      </div>
    </>
  );
}
