import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NFTcontract } from '../contracts';

function AuctionCard({ imageUrl, name, endTime, auctionId, ...rest }) {
  const navigate = useNavigate();
  const [highestBid, setHighestBid] = useState('0');

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

  useEffect(() => {
    async function fetchHighestBid() {
      try {
        const bids = await NFTcontract.getAllBids(auctionId);
        if (bids && bids.length > 0) {
          const latestBid = bids[bids.length - 1];
          setHighestBid(latestBid.amount ? (parseFloat(latestBid.amount) / 1e18).toFixed(3) : '0');
        } else {
          setHighestBid('0');
        }
      } catch {
        setHighestBid('0');
      }
    }
    if (auctionId) fetchHighestBid();
  }, [auctionId]);
  
  return (
    <div
      className="w-[340px] h-[460px] flex flex-col items-center rounded-3xl border-2 border-[rgba(0,255,130,0.2)] bg-gradient-to-br from-[#181c23] to-[#23272f] shadow-xl transition-all duration-300 hover:border-green-400 hover:shadow-[0_0_24px_4px_rgba(0,255,130,0.4)] hover:-translate-y-2 group cursor-pointer p-4 overflow-hidden"
      onClick={() =>
        navigate('/auction', {
          state: {
            imageUrl,
            name,
            endTime,
            auctionId,
            ...rest,
          },
        })
      }
    >
      <div className="w-full h-[380px] flex items-center justify-center overflow-hidden rounded-2xl mb-2 bg-black/40 shadow-lg">
        <img
          src={imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`) : '/placeholder.jpg'}
          alt={name || 'Auction'}
          className="w-full h-[360px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col items-center flex-1 w-full justify-between py-1">
        <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text text-center w-full truncate drop-shadow-lg">{name || 'Auction'}</div>
        <div className="text-white text-xs mt-1">Highest Bid:</div>
        <div className="text-lg font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text drop-shadow-lg">{highestBid} ETH</div>
        <div className="text-white text-xs">Ends:</div>
        <div className="text-base font-bold text-primary font-mono drop-shadow-lg">{formatDateTime(endTime)}</div>
      </div>
    </div>
  );
}

export default AuctionCard;