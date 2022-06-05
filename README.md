# Ethereum NFT minter with backend powered whitelists
*This project should work with every evm compatible networks.*
### Features

##### Public Whitelist
-> You can add / remove wallet addresses on admin panel to allow users to mint.Also you can specify mint amount.
##### Holder Whitelist
->You can specify a spesific nft collection contract address and let the holders mint.You can specify mint amount.It also bans nfts id's after mint so users cannot use the same nft ever again.
https://prnt.sc/NXJN9NWUMsm4
https://prnt.sc/tgCCSfHKmpeY
##### Private Whitelist
->You can add / remove wallet addresses for private sale.

#### Notes
-> Whitelists are stored by mongodb and can be modified by admin panel.
->There are 3 types of whitelists and each of them have a different url on frontend.
->Whitelists are not stored in smart contract to reduce gas costs.
#### Smart Contract
-> Smart contract is in the source code (/contract/contract.sol).

### Tech Stack
->React.js
->Web3.js
->MongoDB
->Solidity
->Moralis (https://moralis.io/)
->Pinata (IPFS) (https://www.pinata.cloud/)

##### Admin Panel:
https://prnt.sc/Jn52obent9bt
https://prnt.sc/AmYbrMNcoTVC

##### Videos:
https://youtu.be/okIrjXQ1ovw
https://youtu.be/mUvnA5dSVHk
https://youtu.be/1z5YD4wmCB4
https://youtu.be/fmVs8jpuQVw



