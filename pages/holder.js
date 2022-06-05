import { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import Holder from "../components/holder";
import Sorry from "../components/sorry";
export default function Home() {
  const rpcUrl =
    process.env.INFURA_RPC_URL; // ropsten
  const [currentUser, setCuser] = useState();

  const [loading, setLoading] = useState(false);


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
      console.log(data2);
      setCuser(data2);
    }
  };

  return (
    <>
      {!currentUser?.wallet ? (
        <div className="container-fluid main-screen connect-container">
          <div className="container">
            <div className="row">
              <div className="col-md-3"></div>
              <div className="col-md-6 text-center">
                <h2>Please Connect</h2>
                <h4>Connect to the network (Accepted Wallet: Metamask).</h4>
                <a
                  onClick={walletLogin}
                  className={`${loading && "disabled-button "} btn main-btn`}
                >
                  CONNECT
                </a>
                <h3>Price : 0.2 ETH (+ Gas fees)</h3>
              </div>
              <div className="col-md-3"></div>
            </div>
          </div>
        </div>
      ) : (
        <><Holder user={currentUser} left={1} /></>
      )}
    </>
  );
}
