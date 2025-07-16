//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    address payable public owner;
    uint256 public listPrice = 0.01 ether;

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
        string tokenURI;
    }

    event TokenListedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed,
        string tokenURI
    );

    event TokenBoughtSuccess (
        uint256 indexed tokenId,
        uint256 price,
        address owner,
        bool currentlyListed
    );

    mapping(uint256 => ListedToken) private idToListedToken;

    // --- Auction Logic ---
    using Counters for Counters.Counter;
    Counters.Counter private _auctionIds;

    struct AuctionItem {
        uint256 auctionId;
        address seller;
        uint256 tokenId;
        uint128 minBid;
        uint128 highestBid;
        address highestBidder;
        uint128 startTime;
        uint128 duration;
        bool settled;
        string auctionURI;
    }

    mapping(uint256 => AuctionItem) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;
    uint256 public auctionFee = 0.01 ether;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 tokenId, uint256 minBid, uint256 endTime, string auctionURI);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionFinalized(uint256 indexed auctionId, uint256 indexed tokenId, address winner, uint256 amount);

    struct Bid {
        address bidder;
        uint128 amount;
        string name;
    }

    // For each auctionId, store an array of bids
    mapping(uint256 => Bid[]) public auctionBids;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    function mintNFT(string memory tokenURI, uint256 price) public payable returns (uint) {
        require(msg.value == listPrice, "Hopefully sending the correct price");
        require(price > 0, "Make sure the price isn't negative");
        (bool sent, ) = owner.call{value: msg.value}("");
        require(sent, "Failed to send mint fee to owner");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        idToListedToken[newTokenId] = ListedToken(
            newTokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true,
            tokenURI
        );

        _transfer(msg.sender, address(this), newTokenId);
        emit TokenListedSuccess(
            newTokenId,
            address(this),
            msg.sender,
            price,
            true,
            tokenURI
        );
        return newTokenId;
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint currentIndex = 0;
        uint currentId;
        for(uint i=0;i<nftCount;i++)
        {
            currentId = i + 1;
            ListedToken storage currentItem = idToListedToken[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return tokens;
    }
    
    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;
        for(uint i=0; i < totalItemCount; i++)
        {
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender){
                itemCount += 1;
            }
        }

        ListedToken[] memory items = new ListedToken[](itemCount);
        for(uint i=0; i < totalItemCount; i++) {
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender) {
                currentId = i+1;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function buyNFT(uint256 tokenId) public payable nonReentrant {
        uint price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].owner = payable(msg.sender);
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        payable(seller).transfer(msg.value);
        emit TokenBoughtSuccess(
            tokenId,
            price,
            msg.sender,
            idToListedToken[tokenId].currentlyListed
        );
    }

    // Create Auction for an owned NFT
    function createAuction(
        uint256 tokenId,
        uint128 minBid,
        uint128 duration,
        string memory auctionURI
    ) external payable {
        require(msg.value == auctionFee, "Must pay 0.01 ETH fee to start auction");
        require(duration >= 60, "Auction duration must be at least 1 minute");
        require(idToListedToken[tokenId].seller == msg.sender || idToListedToken[tokenId].owner == msg.sender, "Not the owner");
        require(_exists(tokenId), "Token does not exist");
        require(!idToListedToken[tokenId].currentlyListed, "NFT is already listed for sale");
        (bool sent, ) = owner.call{value: msg.value}("");
        require(sent, "Failed to send auction fee to owner");
        _auctionIds.increment();
        uint256 newAuctionId = _auctionIds.current();
        auctions[newAuctionId] = AuctionItem({
            auctionId: newAuctionId,
            seller: msg.sender,
            tokenId: tokenId,
            minBid: minBid,
            highestBid: 0,
            highestBidder: address(0),
            startTime: uint128(block.timestamp),
            duration: duration,
            settled: false,
            auctionURI: auctionURI
        });
        emit AuctionCreated(newAuctionId, msg.sender, tokenId, minBid, block.timestamp + duration, idToListedToken[tokenId].tokenURI);
    }

    // Place a bid on an auction
    function placeBid(uint256 auctionId, string memory name) external payable nonReentrant {
        AuctionItem storage item = auctions[auctionId];
        require(block.timestamp < item.startTime + item.duration, "Auction ended");
        require(msg.value > item.highestBid && msg.value >= item.minBid, "Bid too low");
        if (item.highestBidder != address(0)) {
            payable(item.highestBidder).transfer(item.highestBid);
        }
        item.highestBid = uint128(msg.value);
        item.highestBidder = msg.sender;
        bids[auctionId][msg.sender] = msg.value;
        auctionBids[auctionId].push(Bid({
            bidder: msg.sender,
            amount: uint128(msg.value),
            name: name
        }));
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    // Settle an auction
    function settleAuction(uint256 auctionId) external nonReentrant {
        AuctionItem storage item = auctions[auctionId];
        require(block.timestamp >= item.startTime + item.duration, "Auction not ended");
        require(!item.settled, "Already settled");
        item.settled = true;
        if (item.highestBidder != address(0)) {
            _transfer(address(this), item.highestBidder, item.tokenId);
            payable(item.seller).transfer(item.highestBid);
            // Update internal state for NFT ownership
            idToListedToken[item.tokenId].owner = payable(item.highestBidder);
            idToListedToken[item.tokenId].seller = payable(item.highestBidder);
        } else {
            _transfer(address(this), item.seller, item.tokenId);
            // Update internal state for NFT ownership
            idToListedToken[item.tokenId].owner = payable(item.seller);
            idToListedToken[item.tokenId].seller = payable(item.seller);
        }
        emit AuctionFinalized(auctionId, item.tokenId, item.highestBidder, item.highestBid);
    }

    // Get all active auctions
    function getActiveAuctions() external view returns (AuctionItem[] memory) {
        uint256 total = _auctionIds.current();
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            AuctionItem storage item = auctions[i + 1];
            if (!item.settled) {
                count++;
            }
        }
        AuctionItem[] memory items = new AuctionItem[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            AuctionItem storage item = auctions[i + 1];
            if (!item.settled) {
                items[idx] = item;
                idx++;
            }
        }
        return items;
    }

    // Get all non-active (ended or settled) auctions
    function getNonActiveAuctions() external view returns (AuctionItem[] memory) {
        uint256 total = _auctionIds.current();
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            AuctionItem storage item = auctions[i + 1];
            if (item.settled) {
                count++;
            }
        }
        AuctionItem[] memory items = new AuctionItem[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            AuctionItem storage item = auctions[i + 1];
            if (item.settled) {
                items[idx] = item;
                idx++;
            }
        }
        return items;
    }

    // Get my auctions
    function getMyAuctions(address user) external view returns (AuctionItem[] memory) {
        uint256 total = _auctionIds.current();
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            if (auctions[i + 1].seller == user) {
                count++;
            }
        }
        AuctionItem[] memory items = new AuctionItem[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            if (auctions[i + 1].seller == user) {
                items[idx] = auctions[i + 1];
                idx++;
            }
        }
        return items;
    }

    // Get all bids for an auction
    function getAllBids(uint256 auctionId) external view returns (Bid[] memory) {
        return auctionBids[auctionId];
    }

    // Get the current auction ID (auction count)
    function getCurrentAuctionId() public view returns (uint256) {
        return _auctionIds.current();
    }

    // Allow NFT owner to re-list their NFT for sale
    function relistNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Only the NFT owner can relist");
        require(price > 0, "Price must be greater than zero");
        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].price = price;
        idToListedToken[tokenId].seller = payable(msg.sender);
        idToListedToken[tokenId].owner = payable(address(this));
        _transfer(msg.sender, address(this), tokenId);
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true,
            idToListedToken[tokenId].tokenURI
        );
    }
}