import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import sample2 from "../assets/sample2.jpg";

function NFT() {
    // Auction UI state
    const [auctionId, setAuctionId] = useState("");
    const [bidAmount, setBidAmount] = useState("");
    const [auctionStatus, setAuctionStatus] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    // NFT data state
    const [nft, setNft] = useState(null);
    const [nftLoading, setNftLoading] = useState(true);
    const [nftError, setNftError] = useState(null);

    // Example tokenId (replace with router param or prop in real app)
    const tokenId = "1";

    // Fetch NFT data from backend-web2
    useEffect(() => {
        setNftLoading(true);
        fetch(`http://localhost:5000/api/nft/${tokenId}`)   
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setNft(data.nft);
                    setAuctionId(data.nft.auctionId || "");
                } else {
                    setNftError(data.error || "NFT not found");
                }
            })
            .catch(err => setNftError(err.message))
            .finally(() => setNftLoading(false));
    }, [tokenId]);

    // Fetch auction status from backend-web2
    const fetchAuctionStatus = async () => {
        setLoading(true);
        setFeedback(null);
        try {
            const res = await fetch(`http://localhost:5000/api/auction/${auctionId}`);
            const data = await res.json();
            if (data.success) {
                setAuctionStatus(data.auction);
            } else {
                setFeedback(data.error || "Auction not found");
            }
        } catch (err) {
            setFeedback("Failed to fetch auction status");
        } finally {
            setLoading(false);
        }
    };

    // Place bid
    const handleBid = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        try {
            const res = await fetch('http://localhost:4000/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auctionId, amount: bidAmount }),
            });
            const data = await res.json();
            if (res.ok) {
                setFeedback('Bid placed!');
            } else {
                setFeedback(data.error || 'Failed to place bid');
            }
        } catch (err) {
            setFeedback(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="flex w-full max-w-[1400px] mx-auto mt-8 px-4 gap-8">
                {/* Left: NFT Info */}
                <div className="flex-1 max-w-xl h-[900px] bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-10 relative animate-fadeInUp">
                    {nftLoading ? (
                        <div className="text-center text-lg text-text-secondary">Loading NFT...</div>
                    ) : nftError ? (
                        <div className="text-center text-lg text-red-400">{nftError}</div>
                    ) : nft ? (
                        <>
                            <h1 className="text-[3.2rem] font-black bg-accent-gradient bg-clip-text text-transparent mb-2 tracking-tight select-none" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                                {nft.name}
                            </h1>
                            <div className="h-[4px] w-[100px] bg-accent-gradient rounded mb-8" />
                            <h2 className="text-3xl font-bold text-text-primary mb-4 mt-8">About the NFT:</h2>
                            <div className="h-[3px] w-[60px] bg-accent-gradient rounded mb-6" />
                            <p className="text-xl font-semibold text-primary mb-8">{nft.description}</p>
                            <h3 className="text-2xl font-bold text-text-primary mb-6 mt-10">Details</h3>
                            <div className="bg-[rgba(22,23,27,0.5)] rounded-xl p-8 mb-8">
                                <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                                    <span className="text-text-secondary">Id:</span>
                                    <span className="text-primary">{nft.tokenId}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                                    <span className="text-text-secondary">Owner:</span>
                                    <span className="text-primary">{nft.owner}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                                    <span className="text-text-secondary">Price:</span>
                                    <span className="text-primary">{nft.price || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                                    <span className="text-text-secondary">Listed:</span>
                                    <span className="text-primary">{nft.isListed ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between py-3 text-lg">
                                    <span className="text-text-secondary">Auction ID:</span>
                                    <span className="text-primary">{nft.auctionId || 'N/A'}</span>
                                </div>
                            </div>
                        </>
                    ) : null}
                    {/* Auction Section */}
                    <div className="bg-[rgba(0,220,130,0.05)] border border-primary rounded-xl p-8 mt-8">
                        <h3 className="text-xl font-bold text-primary mb-4">Auction & Bidding</h3>
                        <div className="flex flex-col gap-3 mb-4">
                            <label className="text-text-secondary font-semibold">Auction ID</label>
                            <input type="text" value={auctionId} onChange={e => setAuctionId(e.target.value)} className="p-2 border rounded" placeholder="Auction ID" />
                            <button onClick={fetchAuctionStatus} className="bg-primary text-background px-4 py-2 rounded font-bold mt-2">Fetch Auction Status</button>
                        </div>
                        {auctionStatus && (
                            <div className="mb-4 text-text-primary">
                                <div>Highest Bid: {auctionStatus.highestBid} wei</div>
                                <div>Highest Bidder: {auctionStatus.highestBidder}</div>
                                <div>Ends: {new Date(auctionStatus.endTime).toLocaleString()}</div>
                            </div>
                        )}
                        <form onSubmit={handleBid} className="flex flex-col gap-3 mt-4">
                            <label className="text-text-secondary font-semibold">Bid Amount (wei)</label>
                            <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="p-2 border rounded" placeholder="Bid Amount" />
                            <button type="submit" className="bg-accent-gradient text-background px-4 py-2 rounded font-bold mt-2">Place Bid</button>
                        </form>
                        {feedback && <div className="mt-3 text-blue-400">{feedback}</div>}
                    </div>
                    {/* End Auction Section */}
                    <div className="grid grid-cols-3 items-center mt-8">
                        <div className="flex items-center">
                            <i className="fa-regular fa-heart text-2xl text-primary" />
                            <i className="fa-solid fa-heart text-2xl text-primary hidden" />
                        </div>
                        <button className="bg-accent-gradient text-background text-lg font-bold py-3 px-8 rounded-xl shadow-md hover:bg-accent-gradient-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-glow transition-all uppercase tracking-wide justify-self-center">Buy Now</button>
                        <div></div>
                    </div>
                </div>
                {/* Vertical Divider */}
                <div className="w-[2px] bg-white/20 min-h-[500px] mx-4 rounded-full self-stretch" />
                {/* Right: NFT Image */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-6 flex items-center justify-center max-w-xl w-full h-[850px]">
                        <img src={nft && nft.image ? nft.image : sample2} alt="NFT" className="rounded-2xl w-full h-full object-cover" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default NFT;