import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Auction() {
  const [tokenId, setTokenId] = useState('');
  const [minBid, setMinBid] = useState('');
  const [duration, setDuration] = useState('');
  const [auctionId, setAuctionId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Start auction
  const handleStartAuction = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('http://localhost:4000/auction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, minBid, duration }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuctionId(data.auctionId);
        setFeedback('Auction started! Auction ID: ' + data.auctionId);
      } else {
        setFeedback(data.error || 'Failed to start auction');
      }
    } catch (err) {
      setFeedback(err.message);
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

  // Settle auction
  const handleSettle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('http://localhost:4000/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback('Auction settled!');
      } else {
        setFeedback(data.error || 'Failed to settle auction');
      }
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Add fetch for auction status (highest bid, bidder, time left) if backend supports it

  return (
    <div>
      <Header />
      <div className="relative z-[1] mx-auto my-12 max-w-[600px] rounded-2xl shadow-xl bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border p-12 animate-fadeInUp">
        <h1 className="text-center text-[2.5rem] font-black bg-accent-gradient bg-clip-text text-transparent mb-8 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NFT Auction
        </h1>
        <form onSubmit={handleStartAuction} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="block text-lg font-semibold mb-2 text-text-secondary">NFT Token ID</label>
            <input type="text" value={tokenId} onChange={e => setTokenId(e.target.value)} required className="w-full p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="Token ID" />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-text-secondary">Minimum Bid (wei)</label>
            <input type="number" value={minBid} onChange={e => setMinBid(e.target.value)} required className="w-full p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="Minimum Bid" />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-text-secondary">Duration (seconds)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="Duration in seconds" />
          </div>
          <button type="submit" disabled={loading} className="bg-accent-gradient text-background border-none py-3 px-8 rounded-xl text-[1.1rem] font-bold cursor-pointer block mx-auto mt-4 text-center transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow disabled:opacity-60">
            {loading ? 'Starting...' : 'Start Auction'}
          </button>
        </form>
        <form onSubmit={handleBid} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="block text-lg font-semibold mb-2 text-text-secondary">Auction ID</label>
            <input type="text" value={auctionId} onChange={e => setAuctionId(e.target.value)} required className="w-full p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="Auction ID" />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-text-secondary">Bid Amount (wei)</label>
            <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required className="w-full p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="Bid Amount" />
          </div>
          <button type="submit" disabled={loading} className="bg-accent-gradient text-background border-none py-3 px-8 rounded-xl text-[1.1rem] font-bold cursor-pointer block mx-auto mt-4 text-center transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow disabled:opacity-60">
            {loading ? 'Bidding...' : 'Place Bid'}
          </button>
        </form>
        <form onSubmit={handleSettle} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="block text-lg font-semibold mb-2 text-text-secondary">Auction ID</label>
            <input type="text" value={auctionId} onChange={e => setAuctionId(e.target.value)} required className="w-full p-3 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="Auction ID" />
          </div>
          <button type="submit" disabled={loading} className="bg-accent-gradient text-background border-none py-3 px-8 rounded-xl text-[1.1rem] font-bold cursor-pointer block mx-auto mt-4 text-center transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow disabled:opacity-60">
            {loading ? 'Settling...' : 'Settle Auction'}
          </button>
        </form>
        {feedback && (
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded-xl text-blue-200 text-center">
            {feedback}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Auction; 