import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NFTcontract } from '../contracts/contracts';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchDataByName } from '../store/ipfsSlice';

function AuctionPage() {
  const location = useLocation();
  const auction = location.state || {};
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const user = (useSelector(state => state.auth.user)).userName;
  const dispatch = useDispatch();
  const [auctionMeta, setAuctionMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleError, setSettleError] = useState("");
  const [settleSuccess, setSettleSuccess] = useState("");

  // Helper to format timestamp to full date and 24-hour time with seconds
  const formatDateTime = (timestampOrString) => {
    if (!timestampOrString) return '-';
    if (typeof timestampOrString === 'string' && timestampOrString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return timestampOrString;
    }
    let ts = timestampOrString;
    if (typeof ts === 'string' && /^\d+$/.test(ts)) ts = parseInt(ts);
    if (typeof ts === 'number' && ts < 1e12) ts = ts * 1000;
    const d = new Date(ts);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Place bid handler
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess("");
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
      setBidError("Enter a valid bid amount.");
      return;
    }
    setBidLoading(true);
    try {
      // Convert ETH to WEI
      let bidWei;
      try {
        bidWei = window.ethers ? window.ethers.parseEther(bidAmount) : (parseFloat(bidAmount) * 1e18).toString();
      } catch (err) {
        bidWei = (parseFloat(bidAmount) * 1e18).toString();
      }
      // Call contract
      const tx = await NFTcontract.placeBid(auction.auctionId, user, { value: bidWei });
      setBidSuccess("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setBidSuccess("Bid placed successfully!");
      setBidAmount("");
      // Refresh bids
      const allBids = await NFTcontract.getAllBids(auction.auctionId);
      setBids(allBids || []);
    } catch (err) {
      setBidError("Failed to place bid: " + (err?.message || err));
    } finally {
      setBidLoading(false);
    }
  };

  // Fetch auction metadata from IPFS by name
  useEffect(() => {
    async function fetchAuctionMeta() {
      if (!auction.name) {
        setMetaError('No auction name provided.');
        setMetaLoading(false);
        return;
      }
      setMetaLoading(true);
      setMetaError(null);
      try {
        const res = await dispatch(fetchDataByName(auction.name));
        const files = res.payload;
        if (!files || files.length === 0) {
          setMetaError('Auction metadata not found.');
          setAuctionMeta(null);
        } else {
          const file = files[0];
          if (file && file.url) {
            const metaRes = await fetch(file.url);
            const meta = await metaRes.json();
            setAuctionMeta(meta);
          } else {
            setMetaError('Auction metadata file missing URL.');
            setAuctionMeta(null);
          }
        }
      } catch (err) {
        setMetaError('Failed to fetch auction metadata.');
        setAuctionMeta(null);
      } finally {
        setMetaLoading(false);
      }
    }
    fetchAuctionMeta();
  }, [auction.name, dispatch]);

  useEffect(() => {
    async function fetchBids() {
      if (!auction.auctionId) return;
      try {
        const allBids = await NFTcontract.getAllBids(auction.auctionId);
        setBids(allBids || []);
      } catch (err) {
        setBids([]);
      }
    }
    fetchBids();
  }, [auction.auctionId]);

  // Helper to check if auction is ended
  const isAuctionEnded = () => {
    const now = Date.now() / 1000;
    let end = display.endTime;
    if (typeof end === 'string' && /^\d{4}-\d{2}-\d{2}/.test(end)) {
      end = new Date(end).getTime() / 1000;
    } else if (typeof end === 'string' && /^\d+$/.test(end)) {
      end = parseInt(end);
      if (end < 1e12) end = end * 1000;
      end = end / 1000;
    } else if (typeof end === 'number' && end > 1e12) {
      end = end / 1000;
    }
    return now > end;
  };

  // Settle auction handler
  const handleSettleAuction = async () => {
    setSettleLoading(true);
    setSettleError("");
    setSettleSuccess("");
    try {
      const tx = await NFTcontract.settleAuction(auction.auctionId);
      await tx.wait();
      // Update NFT owner on IPFS
      // 1. Get highest bidder's username from bids
      const allBids = await NFTcontract.getAllBids(auction.auctionId);
      const highestBid = allBids && allBids.length > 0 ? allBids[allBids.length - 1] : null;
      if (highestBid && auction.tokenId) {
        // 2. Fetch NFT metadata from IPFS
        const nftMetaRes = await fetchDataByName(auctionMeta.nftName || auction.nft_name || auction.name);
        const nftFiles = nftMetaRes.payload;
        if (nftFiles && nftFiles.length > 0) {
          const nftFile = nftFiles[0];
          const nftUrl = nftFile.url;
          const nftId = nftFile.id;
          const resp = await fetch(nftUrl);
          const nftMeta = await resp.json();
          // 3. Update owner field
          nftMeta.owner = highestBid.name;
          // 4. Push update to backend
          await fetch('https://metamint.onrender.com/api/update-pinata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: nftId, updatedData: nftMeta }),
          });
        }
      }
      setSettleSuccess("Auction settled successfully!");
    } catch (err) {
      setSettleError("Failed to settle auction: " + (err?.message || err));
    } finally {
      setSettleLoading(false);
    }
  };

  if (!auction || !auction.auctionId) {
    return <div className="text-center text-lg text-red-400 mt-20">No auction data found.</div>;
  }

  if (metaLoading) {
    return <div className="text-center text-lg text-primary mt-20">Loading auction details...</div>;
  }
  if (metaError) {
    return <div className="text-center text-lg text-red-400 mt-20">{metaError}</div>;
  }

  // Use auctionMeta for display if available, fallback to auction
  let isOwner = false;
  if (auctionMeta && auctionMeta.seller && user) {
    isOwner = user === auctionMeta.seller;
  } else if (auction && auction.seller && user) {
    isOwner = user === auction.seller;
  }
  const display = auctionMeta || auction;

  return (
    <div>
        <Header />
      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto mt-8 px-2 md:px-4 gap-8">
        {/* Left: NFT Image */}
        <div className="flex-1 max-w-xl w-full bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-4 md:p-10 flex items-center justify-center mb-6 lg:mb-0">
          <img src={display.imageUrl ? (display.imageUrl.startsWith('http') ? display.imageUrl : `https://${display.imageUrl}`) : '/placeholder.jpg'} alt="NFT" className="rounded-2xl w-full h-auto max-h-[400px] md:max-h-[700px] object-cover shadow-lg" />
        </div>
        {/* Right: Auction Details & Bidding */}
        <div className="flex-1 max-w-xl w-full bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-4 md:p-10 relative animate-fadeInUp flex flex-col gap-8">
          <div>
            <h1 className="text-[2.5rem] font-black bg-accent-gradient bg-clip-text text-transparent tracking-tight select-none mb-2" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>{display.name}</h1>
            <div className="h-[4px] w-[100px] bg-accent-gradient rounded mb-6" />
            <div className="text-lg text-primary mb-4 font-semibold">{display.description}</div>
            <div className="mb-2 text-white text-base"><b>Seller:</b> <span className="text-secondary font-mono">{display.seller}</span></div>
            <div className="mb-2 text-white text-base"><b>Start Time:</b> <span className="font-mono">{formatDateTime(display.startTime)}</span></div>
            <div className="mb-2 text-white text-base"><b>End Time:</b> <span className="font-mono">{formatDateTime(display.endTime)}</span></div>
            <div className="mb-4 text-white text-base"><b>Current Highest Bid:</b> <span className="text-primary font-bold">{auction.highestBid} ETH</span></div>
          </div>
          {/* Place Bid Section */}
          <div className="w-full flex flex-col gap-8">
            {!isOwner && (
              <div className="w-full bg-white/5 border border-primary/30 rounded-xl shadow-lg p-6 flex flex-col gap-4 max-w-lg mx-auto">
                <div className="text-xl font-bold text-primary mb-1 text-center tracking-tight">Place a Bid</div>
                <form onSubmit={handlePlaceBid} className="flex flex-col gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    className="w-full px-4 py-3 rounded-lg border border-primary/40 bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-primary text-lg font-mono placeholder:text-gray-400"
                    placeholder="Enter bid amount in ETH"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    disabled={bidLoading}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg shadow-md hover:scale-105 transition-transform disabled:opacity-60 text-lg"
                    disabled={bidLoading}
                  >
                    {bidLoading ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                  {bidError && <div className="text-red-400 text-center text-base mt-1">{bidError}</div>}
                  {bidSuccess && <div className="text-green-400 text-center text-base mt-1">{bidSuccess}</div>}
                </form>
              </div>
            )}
            {isOwner && (
              <div className="w-full bg-white/5 border border-primary/30 rounded-xl shadow-lg p-6 text-center text-lg text-gray-400 font-semibold max-w-lg mx-auto">You are the owner of this auction.</div>
            )}
            {isOwner && isAuctionEnded() && (
              <div className="w-full flex flex-col items-center mb-6">
                <button
                  onClick={handleSettleAuction}
                  className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg shadow-md hover:scale-105 transition-transform disabled:opacity-60 text-lg mb-2"
                  disabled={settleLoading}
                >
                  {settleLoading ? 'Settling Auction...' : 'Settle Auction'}
                </button>
                {settleError && <div className="text-red-400 text-center text-base mt-1">{settleError}</div>}
                {settleSuccess && <div className="text-green-400 text-center text-base mt-1">{settleSuccess}</div>}
              </div>
            )}
            <div className="w-full border-t border-glass-border my-6"></div>
            {/* Bids List */}
            <div className="w-full">
              <h2 className="text-xl font-bold mb-4 text-white">Bid History</h2>
              {bids.length === 0 ? (
                <div className="text-gray-400">No bids yet.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-xl bg-white/5 border border-primary/20 shadow-inner">
                  <div className="flex px-6 py-3 font-semibold text-primary text-base border-b border-primary/20 sticky top-0 bg-black/40 z-10 rounded-t-xl">
                    <div className="w-1/2">Bidder</div>
                    <div className="w-1/2 text-center">Amount</div>
                  </div>
                  {bids.map((bid, idx) => {
                    const isHighest = idx === bids.length - 1;
                    return (
                      <div
                        key={idx}
                        className={`flex px-6 py-3 items-center text-base transition-colors ${isHighest ? 'bg-gradient-to-r from-primary/10 to-secondary/10' : 'hover:bg-white/10'} ${idx % 2 === 0 ? 'bg-black/10' : 'bg-black/5'}`}
                      >
                        <div className="w-1/2 font-mono truncate flex items-center gap-2" title={bid.bidder}>
                          {bid.bidder?.slice(0, 6)}...{bid.bidder?.slice(-4)}
                          {isHighest && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold align-middle">Highest</span>}
                        </div>
                        <div className="w-1/2 text-center font-bold text-white flex items-center justify-center gap-1">
                          <svg className="w-5 h-5 text-primary inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20m0 0l-6-6m6 6l6-6"/></svg>
                          {(bid.amount ? (parseFloat(bid.amount) / 1e18).toFixed(3) : '0')} ETH
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        <Footer />
    </div>
  );
}

export default AuctionPage;