import { useState, useEffect, useRef } from "react";
import Web3 from "web3";
export default function Home() {

  const [auth, setAuth] = useState();
    const [adminWallet,setAdminWallet]=useState();
    const [loading,setLoading]=useState(true);
    const [whiteList,setWhiteList]=useState();
    const [editId,setEditId]=useState();
    const [importModal,setImportModal]=useState(false);
    const [importedWL,setImportedWL]=useState();
    const [wlType,setWlType]=useState("paid");
    const [collectionWl,setcollectionWl]=useState([]);
    const nftwlContract=useRef();
    const addressValue=useRef();
    const amountValue=useRef();

    const initFunction=async()=>{
      const req = await fetch(`/api/adminFetch`);
      const nonce_data = await req.json();
      setLoading(false);
      setAdminWallet(nonce_data?.whitelist);
      setWhiteList(await whiteListFetch());
    }
  useEffect(async()=>{
      await initFunction();
 
  },[])

  const importWlNFTContract=async()=>{
    if(nftwlContract.current.value){
      setLoading(true)
      const checkSumAddress=Web3.utils.toChecksumAddress(nftwlContract.current.value);
      const req2 = await fetch(`/api/whitelistNFTimport`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret:auth.secret,
          nftcontract:checkSumAddress
        }),
      });
      const data2 = await req2.json();
      if(data2.status==="ok"){
        setcollectionWl([...collectionWl,{collection:checkSumAddress,bannedIds:[]}]);
      }
      setLoading(false)
    }
   
  }

  const walletLogin = async () => {
    const address = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = window.ethereum;
    const web3 = new Web3(provider);

    const req = await fetch(`/api/nonce`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: address[0],
      }),
    });
    const nonce_data = await req.json();
    const signature = await web3.eth.personal.sign(
      nonce_data.nonce,
      address[0]
    );

    const req2 = await fetch(`/api/auth`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sign: signature,
        wallet: address[0],
      }),
    });
    const data2 = await req2.json();
    if (data2) {
      if(data2?.wallet.toLowerCase()===adminWallet.toLowerCase()){
        setAuth(data2);
      }
    }
  };
  const whiteListFetch=async()=>{
    const req = await fetch("/api/whitelist");
    const data = await req.json();
    console.log(data.collectionwl)
    setcollectionWl(data.collectionwl);
    return(data.whitelist)
  }
  const handleSave=async(id,addressValue,amountValue)=>{
    const req = await fetch(`/api/whitelistEdit`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id:id,
        address:addressValue,
        amount:amountValue,
        secret:auth.secret
      }),
    });
    const data = await req.json();
    console.log(data)
    if(data?.status){
      let newWl=whiteList.map(v=>v._id==id?{
        ...v,
        address:addressValue,
        amount:amountValue
      }:v)
      setWhiteList(newWl);
        setEditId(99);
    }

  }
  const handleRemove=async(id)=>{

    const req = await fetch(`/api/whitelistRemove`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id:id,
        secret:auth.secret
      }),
    });
    const data = await req.json();
    if(data?.status){
      let newWl=whiteList.filter(v=>v._id!=id)
      setWhiteList(newWl);
    }
  }

  const showFile = async (e) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => { 
      const text = (e.target.result)
      setImportedWL(text)
    };
    reader.readAsText(e.target.files[0])
  }

  const whitelistImportHandler=async()=>{
    setLoading(true)
    const req2 = await fetch(`/api/whitelistimport`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret:auth.secret,
        whitelistAddressList:importedWL
      }),
    });
    const data2 = await req2.json();
    if(data2.status=="updated"){
      await initFunction();
      setImportModal(false);
    }
    setLoading(false)
  }

  return (
    <>
    
     {!auth?.secret ? (
        <div className="container-fluid main-screen connect-container ">
          <div className="container">
            <div className="row">
              <div className="col-md-3"></div>
              <div className="col-md-6 text-center">
                <h2>Please Connect</h2>
                <a
                  onClick={walletLogin}
                  className={`${loading && "disabled-button "} btn main-btn`}
                >
                  Login
                </a>
                
              </div>
              <div className="col-md-3"></div>
            </div>
          </div>
        </div>
      ):<>

      {wlType==="paid"?<>
      <div className={`${!importModal&&"d-none"}`} tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Whitelist Import</h5>
       
      </div>
      <div className="modal-body">
      <div className="mb-3">
  <label htmlFor="formFile" className="form-label">Upload import file</label>
  <input className="form-control" type="file" id="formFile" onChange={(e) => showFile(e)}/>
</div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={()=> {setImportModal(!importModal)}}>Close</button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={whitelistImportHandler}>IMPORT</button>
      </div>
    </div>
  </div>
</div>


<div className="admin-font">

     
<div className="card">
  <div className="card-body main-card">
    <div className="title-container"><h1 className="">PAID Whitelist /&nbsp; </h1><h1 onClick={()=>{setWlType("free")}} className="inactive-title"> Free Whitelist</h1></div>

<div className="card">
<div className="card-body">
<button onClick={()=> {setImportModal(!importModal)}} type="button" className="btn btn-outline-dark">IMPORT</button>
</div>
</div>
<table className="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Address</th>
      <th scope="col">Amount</th>
      <th scope="col">Options</th>
    </tr>
  </thead>
  <tbody>
    {whiteList&&whiteList?.map((v,i)=>editId==i?<tr key={i}>
        <th scope="row">{i}</th>
        <td><input ref={addressValue} defaultValue={v.address}/></td>
        <td><input ref={amountValue} defaultValue={v.amount}/></td>
        <td><u onClick={()=>{handleRemove(v._id,i)}} style={{cursor:"pointer"}}>Remove</u><br/><u onClick={()=>{handleSave(v._id,addressValue.current.value,amountValue.current.value)}} style={{cursor:"pointer"}}>Save</u></td>
      </tr>:<tr key={i}>
        <th scope="row">{i}</th>
        <td>{v.address}</td>
        <td>{v.amount}</td>
        <td><img onClick={()=>{setEditId(i)}} style={{cursor:"pointer"}} width={"20px"} src="/edit.svg"/></td>
      </tr>
    )}
    


  </tbody>
</table>





  
</div>
        
        </div>


        </div>
      </>:<>

      <div className="admin-font">

     
<div className="card">
  <div className="card-body main-card">
    <div className="title-container"><h1 onClick={()=>{setWlType("paid")}} className="inactive-title">PAID Whitelist /&nbsp; </h1><h1 className=""> Free Whitelist</h1></div>
      <div className="d-flex mb-10">
    <button onClick={importWlNFTContract} disabled={loading} type="button" class="btn btn-outline-secondary">Add New</button> 
    <input ref={nftwlContract} type="text" class="form-control" placeholder="NFT Contract Address" ></input>
    </div>
<table className="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">NFT Contract</th>
      <th scope="col">banned Ids</th>
    </tr>
  </thead>
  <tbody>
   
    {collectionWl&&collectionWl.map((v,i)=><tr>
        <td>{i}</td>
        <td>{v.collection}</td>
        <td>{v.bannedIds.toString()}</td>
    </tr>)}


  </tbody>
</table>





  
</div>
        
        </div>


        </div>

      </>}

   

      </>}
    </>
  );
}
