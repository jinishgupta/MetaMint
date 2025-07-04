import Auction from '../models/auction.js';

export const saveAuction = async (req, res) => {
    try {
        const { auctionId, tokenId, seller, minBid, highestBid, highestBidder, endTime, settled } = req.body;
        let auction = await Auction.findOne({ auctionId });
        if (auction) {
            auction.tokenId = tokenId;
            auction.seller = seller;
            auction.minBid = minBid;
            auction.highestBid = highestBid;
            auction.highestBidder = highestBidder;
            auction.endTime = endTime;
            auction.settled = settled;
            await auction.save();
        } else {
            auction = new Auction({ auctionId, tokenId, seller, minBid, highestBid, highestBidder, endTime, settled });
            await auction.save();
        }
        res.json({ success: true, auction });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find();
        res.json({ success: true, auctions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getAuctionById = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const auction = await Auction.findOne({ auctionId });
        if (!auction) return res.status(404).json({ success: false, error: 'Auction not found' });
        res.json({ success: true, auction });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};  