// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Auction is ReentrancyGuard {
    struct AuctionItem {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool settled;
    } 
 
    mapping(uint256 => AuctionItem) public auctions;
    uint256 public auctionCount;
    mapping(uint256 => mapping(address => uint256)) public bids;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, address nftAddress, uint256 tokenId, uint256 minBid, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionSettled(uint256 indexed auctionId, address winner, uint256 amount);

    function createAuction(address nftAddress, uint256 tokenId, uint256 minBid, uint256 duration) external {
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        nft.transferFrom(msg.sender, address(this), tokenId);
        auctionCount++;
        auctions[auctionCount] = AuctionItem({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            minBid: minBid,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            settled: false
        });
        emit AuctionCreated(auctionCount, msg.sender, nftAddress, tokenId, minBid, block.timestamp + duration);
    }

    function bid(uint256 auctionId) external payable nonReentrant {
        AuctionItem storage item = auctions[auctionId];
        require(block.timestamp < item.endTime, "Auction ended");
        require(msg.value > item.highestBid && msg.value >= item.minBid, "Bid too low");
        if (item.highestBidder != address(0)) {
            payable(item.highestBidder).transfer(item.highestBid);
        }
        item.highestBid = msg.value;
        item.highestBidder = msg.sender;
        bids[auctionId][msg.sender] = msg.value;
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function settleAuction(uint256 auctionId) external nonReentrant {
        AuctionItem storage item = auctions[auctionId];
        require(block.timestamp >= item.endTime, "Auction not ended");
        require(!item.settled, "Already settled");
        item.settled = true;
        if (item.highestBidder != address(0)) {
            IERC721(item.nftAddress).transferFrom(address(this), item.highestBidder, item.tokenId);
            payable(item.seller).transfer(item.highestBid);
        } else {
            IERC721(item.nftAddress).transferFrom(address(this), item.seller, item.tokenId);
        }
        emit AuctionSettled(auctionId, item.highestBidder, item.highestBid);
    }
} 