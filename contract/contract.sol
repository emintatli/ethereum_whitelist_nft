// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public owner = 0xCDeF3CC7cDBdC8695674973Ad015D9f2B01dD4C4;
    address public wlMinter=0xCDeF3CC7cDBdC8695674973Ad015D9f2B01dD4C4;
    address public pbMinter=0x37af0f288a562AaF5828eE1e1058f855125b6E8e;
    address public holderMinter=0xcC42F829dD56035afEE379769C3e1A3d05D52644;
    uint256 public normalPrice = 10000000000000000;  // 0.01ETH
    uint256 public totalMint = 0;
    uint256 public maxMint = 1000;
    bool public publicMintOpen=false;
    string public baseUrl =
        "https://gateway.pinata.cloud/ipfs/QmToJQzZ8BpqZE4uVE8ZcRGemK3MUwbyjhHCGo7GpAtn3K/";

    constructor() ERC721("Description", "NFT") {}

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "ADMIN_ONLY");
        _;
    }

    function append(
        string memory a,
        string memory b,
        string memory c
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }


    
       

    function awardItemWL(address player, uint256 tokenCount,bytes32 message, bytes memory sig) public payable {
        require(msg.value>=tokenCount*normalPrice);
        require(recoverSigner(message,sig)==wlMinter);
        require(totalMint<=maxMint);

        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
        }

    }

        function awardItemHolder(address player,bytes32 message, bytes memory sig) public payable {
        require(recoverSigner(message,sig)==holderMinter);
        require(totalMint<=maxMint);
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
    
    }


        function awardItemPB(address player, uint256 tokenCount,bytes32 message, bytes memory sig) public payable {
        require(msg.value>=tokenCount*normalPrice);
        require(recoverSigner(message,sig)==pbMinter);
        require(totalMint<=maxMint);
        require(publicMintOpen);
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
        }

    }

    function claimBalance(uint256 withdrawAmount) external onlyOwner {
        payable(msg.sender).transfer(withdrawAmount);
    }

    function changeOwner(address adres) external onlyOwner {
        require(adres != address(0));
        owner = adres;
    }

      function changePublicMint(bool boo) external onlyOwner {
        publicMintOpen=boo;
    }

     function recoverSigner(bytes32 message, bytes memory sig)
       public
       pure
       returns (address)
    {
       uint8 v;
       bytes32 r;
       bytes32 s;

       (v, r, s) = splitSignature(sig);
       return ecrecover(message, v, r, s);
  }
  function splitSignature(bytes memory sig)
       public
       pure
       returns (uint8, bytes32, bytes32)
   {
       require(sig.length == 65);
       
       bytes32 r;
       bytes32 s;
       uint8 v;

       assembly {
           // first 32 bytes, after the length prefix
           r := mload(add(sig, 32))
           // second 32 bytes
           s := mload(add(sig, 64))
           // final byte (first byte of the next 32 bytes)
           v := byte(0, mload(add(sig, 96)))
       }

       return (v, r, s);
   }
}
