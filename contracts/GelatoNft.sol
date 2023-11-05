// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract GelatoNft is ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public tokenIds;
    address public immutable gelatoMsgSender;
    string public constant notRevealedUri =
        "https://bafkreid2ribchf7vnxtmrmpf7jkbgtohlbof5j4stiippcpmqs37s6o7ze.ipfs.nftstorage.link/";
    mapping(address => bool) public hasMinted;
    mapping(address => uint256) public tokenIdByUser;
    mapping(uint256 => bool) public nightTimeByToken;
    event MetadataUpdates(uint256 _tokenId);
    event MintEvent(uint256 _tokenId);

    constructor(
        address _gelatoMsgSender
    ) ERC721("Gelato POLYGON NFT", "GEL-POLYGON-NFT") {
        gelatoMsgSender = _gelatoMsgSender;
    }

    modifier onlyGelatoMsgSender() {
        require(
            msg.sender == gelatoMsgSender,
            "Only dedicated gelato msg.sender"
        );
        _;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
// SECRET_PHASE: FROZE
    function mint(bool _isNight) external whenNotPaused {
        require(!hasMinted[msg.sender], "Already minted!");
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, notRevealedUri);
        hasMinted[msg.sender] = true;
        tokenIdByUser[msg.sender] = newItemId;
        nightTimeByToken[newItemId] = _isNight;
        emit MintEvent(newItemId);
    }

    function revealNft(
        uint256 tokenId,
        string memory tokenURI
    ) external onlyGelatoMsgSender {
        _setTokenURI(tokenId, tokenURI);
        emit MetadataUpdates(tokenId);
    }
}
