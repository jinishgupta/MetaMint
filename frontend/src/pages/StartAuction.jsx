import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from 'react';
import { NFTcontract } from '../contracts';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { uploadData } from "../store/ipfsSlice";
import { ethers } from "ethers";

function StartAuction() {
  const [nftId, setNftId] = useState("");
  const [minBid, setMinBid] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [userNFTs, setUserNFTs] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txSuccess, setTxSuccess] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      setError(null);
      try {
        const nfts = await NFTcontract.getMyNFTs();
        const nftDetails = await Promise.all(
          nfts.map(async (nft) => {
            const tokenURI = nft.tokenURI?.toString?.() || nft.tokenURI;
            let metadata = null;
            if (tokenURI) {
              let url = tokenURI;
              url = `https://${tokenURI}`;
              try {
                const resp = await fetch(url);
                metadata = await resp.json();
              } catch (err) {
                metadata = null;
              }
            }
            // Use tokenId as string for selection and dropdown
            return metadata ? {
              tokenId: nft.tokenId?.toString?.() || nft.tokenId,
              name: metadata.name,
              imageUrl: metadata.image || metadata.imageUrl || '',
              description: metadata.description || '',
              category: metadata.category || '',
              price: metadata.price || '',
              owner: metadata.owner || '',
              ...metadata
            } : null;
          })
        );
        setUserNFTs(nftDetails.filter(Boolean));
      } catch (err) {
        setError("Failed to fetch your NFTs. Please connect your wallet.");
        setUserNFTs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, []);

  const handleStartAuction = async (e) => {
    e.preventDefault();
    setTxLoading(true);
    setTxError(null);
    setTxSuccess(null);
    // Input validation
    if (!title || !description) {
      setTxError('Title and description are required.');
      setTxLoading(false);
      return;
    }
    if (/<|>|script/i.test(title) || /<|>|script/i.test(description)) {
      setTxError('Invalid characters in title or description.');
      setTxLoading(false);
      return;
    }
    if (isNaN(minBid) || parseFloat(minBid) <= 0) {
      setTxError('Minimum bid must be a positive number.');
      setTxLoading(false);
      return;
    }
    if (isNaN(durationMinutes) || parseInt(durationMinutes) < 1) {
      setTxError('Auction duration must be at least 1 minute.');
      setTxLoading(false);
      return;
    }
    try {
      // 1. Get current auctionId from contract
      let currentAuctionId;
      try {
        currentAuctionId = await NFTcontract.getCurrentAuctionId();
      } catch (err) {
        setTxError('Failed to get current auction ID.');
        setTxLoading(false);
        return;
      }
      // 2. Get start time and end time
      // Format start and end time as full date and 24-hour time with seconds
      const formatDateTime = (timestamp) => {
        const d = new Date(timestamp * 1000);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const startTime = Math.floor(Date.now() / 1000);
      const durationSeconds = parseInt(durationMinutes) * 60;
      const endTime = startTime + durationSeconds;
      // 3. Get NFT details for selected NFT
      const selectedNFT = userNFTs.find(nft => String(nft.tokenId) === String(nftId));
      // 4. Prepare metadata (include NFT image and details)
      const meta = {
        name: title,
        description,
        imageUrl: selectedNFT?.imageUrl || '',
        nftName: selectedNFT?.name || '',
        nftDescription: selectedNFT?.description || '',
        nftCategory: selectedNFT?.category || '',
        startTime: formatDateTime(startTime),
        endTime: formatDateTime(endTime),
        type:"auction",
        seller: user?.userName,
        auctionId: currentAuctionId?.toString?.() || currentAuctionId,
        tokenId: nftId,
      };
      // 5. Upload metadata to IPFS
      let uploadResult;
      try {
        uploadResult = await dispatch(uploadData(meta)).unwrap();
      } catch (err) {
        setTxError('Failed to upload auction metadata.');
        setTxLoading(false);
        return;
      }
      const auctionURI = uploadResult.metadataUrl;
      // 6. Call createAuction on contract
      try {
        // Convert minBid (ETH) to WEI
        let minBidWei;
        try {
          minBidWei = ethers.parseEther(minBid);
        } catch (err) {
          minBidWei = (parseFloat(minBid) * 1e18).toString();
        }
        // Ensure auctionURI is a string
        const auctionURIStr = String(auctionURI || '');
        // Fetch auction fee from contract
        let auctionFeeWei;
        try {
          auctionFeeWei = (await NFTcontract.getListPrice()).toString();
        } catch (err) {
          auctionFeeWei = "10000000000000000"; // fallback 0.01 ETH
        }
        const tx = await NFTcontract.createAuction(
          nftId,
          minBidWei,
          durationSeconds,
          auctionURIStr,
          { value: auctionFeeWei }
        );
        await tx.wait(); 
      } catch (err) {
        setTxError('Failed to create auction on blockchain.');
        setTxLoading(false);
        return;
      }
      setTxSuccess('Auction started successfully!');
      setTimeout(() => navigate('/search-and-sort#auction'), 1500);
    } catch (err) {
      setTxError('Failed to start auction.');
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex justify-center items-center min-h-[80vh] py-10">
        <div className="w-full max-w-xl bg-[rgba(22,23,27,0.95)] border-2 border-glass-border rounded-3xl shadow-2xl p-10 flex flex-col gap-8 animate-fadeInUp">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-6 text-center drop-shadow-lg">Start a New Auction</h1>
          <form onSubmit={handleStartAuction} className="flex flex-col gap-6">
            <div>
              <label className="block text-lg font-semibold text-white mb-2">Select NFT</label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary text-lg"
                value={nftId}
                onChange={e => setNftId(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">-- Select your NFT --</option>
                {userNFTs.map(nft => (
                  <option key={nft.tokenId} value={nft.tokenId}>{nft.name} (#{nft.tokenId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-white mb-2">Auction Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary text-lg"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-white mb-2">Description</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary text-lg"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold text-white mb-2">Minimum Bid (ETH)</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary text-lg"
                  value={minBid}
                  onChange={e => setMinBid(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold text-white mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-secondary text-lg"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-60 text-xl"
              disabled={loading || txLoading}
            >
              {txLoading ? 'Starting Auction...' : 'Start Auction'}
            </button>
            {error && <div className="text-red-400 text-center text-base mt-2">{error}</div>}
            {txError && <div className="text-red-400 text-center text-base mt-2">{txError}</div>}
            {txSuccess && <div className="text-green-400 text-center text-base mt-2">{txSuccess}</div>}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default StartAuction;