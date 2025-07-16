import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NFTcontract } from '../contracts/contracts';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { updateData } from '../store/ipfsSlice';

function NFT() {
  const location = useLocation();
  const data = location.state || {};
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState("");
  const [nft, setNft] = useState(data);
  const [favorited, setFavorited] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Increment views on mount
  useEffect(() => {
    if (!nft.id) return;
    const updateViews = async () => {
      const updatedNft = { ...nft, views: (parseInt(nft.views) || 0) + 1 };
      setNft(updatedNft);
      await fetch('https://metamint.onrender.com/api/update-pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nft.id, updatedData: updatedNft }),
      });
    };
    updateViews();
    // eslint-disable-next-line
  }, [nft.id]);

  // Handle favorite
  const handleFavorite = async () => {
    if (!nft.id) return;
    let favs = [];
    try {
      favs = JSON.parse(localStorage.getItem('favoritedNfts')) || [];
    } catch {}
    if (!favorited) {
      // Add to favorites
      const updatedNft = { ...nft, favorites: (parseInt(nft.favorites) || 0) + 1 };
      setNft(updatedNft);
      setFavorited(true);
      await fetch('https://metamint.onrender.com/api/update-pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nft.id, updatedData: updatedNft }),
      });
      if (!favs.includes(nft.name)) {
        favs.push(nft.name);
        localStorage.setItem('favoritedNfts', JSON.stringify(favs));
      }
    } else {
      // Remove from favorites
      const updatedNft = { ...nft, favorites: Math.max((parseInt(nft.favorites) || 1) - 1, 0) };
      setNft(updatedNft);
      setFavorited(false);
      await fetch('https://metamint.onrender.com/api/update-pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nft.id, updatedData: updatedNft }),
      });
      favs = favs.filter(name => name !== nft.name);
      localStorage.setItem('favoritedNfts', JSON.stringify(favs));
    }
  };

  const handleBuy = async () => {
    setBuying(true);
    setBuyResult("");
    try {
      // Check if wallet is connected
      const walletAddress = localStorage.getItem('walletAddress');
      if (!window.ethereum || !walletAddress) {
        setBuyResult("Please connect your wallet first!");
        setBuying(false);
        return;
      }
      // Validate price
      const priceEth = nft.price;
      if (!priceEth || isNaN(priceEth) || parseFloat(priceEth) <= 0) {
        setBuyResult("Invalid NFT price.");
        setBuying(false);
        return;
      }
      // Validate tokenId
      const tokenId = nft.tokenId;
      if (!tokenId || isNaN(tokenId)) {
        setBuyResult("No valid tokenId provided for this NFT.");
        setBuying(false);
        return;
      }
      // Convert price to wei
      let priceWei;
      try {
        priceWei = window.ethers ? window.ethers.parseEther(priceEth) : (parseFloat(priceEth) * 1e18).toString();
      } catch (err) {
        priceWei = (parseFloat(priceEth) * 1e18).toString();
      }
      let tx;
      try {
        tx = await NFTcontract.buyNFT(tokenId, { value: priceWei });
      } catch (err) {
        setBuyResult("Blockchain buy failed: " + (err.message || err));
        setBuying(false);
        return;
      }
      setBuyResult("Waiting for transaction confirmation...");
      try {
        await tx.wait();
      } catch (err) {
        setBuyResult("Transaction failed: " + (err.message || err));
        setBuying(false);
        return;
      }
      setBuyResult("NFT purchased successfully!");
      // Update owner username after purchase
      const newOwner = user.userName || walletAddress;
      const updatedNft = { ...nft, owner: newOwner, currentlyListed: false };
      setNft(updatedNft);
      // Update owner and currentlyListed on IPFS using updateData
      if (nft.id) {
        await dispatch(updateData({ id: nft.id, updatedData: updatedNft }));
      }
    } finally {
      setBuying(false);
    }
  };

  // Relist NFT handler
  const handleRelist = async () => {
    const price = prompt("Enter the price (in ETH) to relist your NFT:");
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      alert("Invalid price.");
      return;
    }
    try {
      let priceWei;
      try {
        priceWei = window.ethers ? window.ethers.parseEther(price) : (parseFloat(price) * 1e18).toString();
      } catch (err) {
        priceWei = (parseFloat(price) * 1e18).toString();
      }
      await NFTcontract.relistNFT(nft.tokenId, priceWei);
      // Update IPFS metadata: set currentlyListed true and new price
      const updatedNft = { ...nft, currentlyListed: true, price };
      setNft(updatedNft);
      if (nft.id) {
        await dispatch(updateData({ id: nft.id, updatedData: updatedNft }));
      }
      alert("NFT relisted successfully!");
    } catch (err) {
      alert("Failed to relist NFT: " + (err.message || err));
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto mt-8 px-2 md:px-4 gap-8">
        {/* Left: NFT Info */}
        <div className="flex-1 max-w-xl w-full bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-4 md:p-10 relative animate-fadeInUp mb-6 lg:mb-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-[2rem] md:text-[3.2rem] font-black bg-accent-gradient bg-clip-text text-transparent tracking-tight select-none" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              {nft.name}
            </h1>
            <button onClick={handleFavorite} className="focus:outline-none ml-4" title={favorited ? 'Remove from favorites' : 'Add to favorites'}>
              <FontAwesomeIcon icon={favorited ? faSolidHeart : faRegularHeart} className="text-2xl md:text-3xl text-primary transition-colors duration-200" />
            </button>
          </div>
          <div className="h-[4px] w-[100px] bg-accent-gradient rounded mb-8" />
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 mt-8">About the NFT:</h2>
          <div className="h-[3px] w-[60px] bg-accent-gradient rounded mb-6" />
          <p className="text-lg md:text-xl font-semibold text-primary mb-8">{nft.description}</p>
          <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-6 mt-10">Details</h3>
          <div className="bg-[rgba(22,23,27,0.5)] rounded-xl p-8 mb-8">
            <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
              <span className="text-text-secondary">Owner:</span>
              <span className="text-primary">{nft.owner}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
              <span className="text-text-secondary">Category:</span>
              <span className="text-primary">{nft.category}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
              <span className="text-text-secondary">Views:</span>
              <span className="text-primary">{nft.views}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
              <span className="text-text-secondary">Favorites:</span>
              <span className="text-primary">{nft.favorites}</span>
            </div>
            <div className="flex justify-between py-3 text-lg">
              <span className="text-text-secondary">Price:</span>
              <span className="text-primary">{nft.price} ETH</span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-8">
            <div className="nft-actions">
              <button
                onClick={handleBuy}
                disabled={buying || !nft.currentlyListed}
                className={`buy-btn ${!nft.currentlyListed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {buying ? 'Processing...' : 'Buy NFT'}
              </button>
              {/* Show relist button and tag if not currently listed and user is owner */}
              {!nft.currentlyListed && (nft.owner === (user?.userName || user?.walletAddress)) && (
                <>
                  <button
                    onClick={handleRelist}
                    className="relist-btn bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Relist NFT
                  </button>
                  <div className="not-available-tag text-red-500 font-bold mt-2">NFT is not available to buy</div>
                </>
              )}
              {/* Show tag if not available to buy and not owner */}
              {!nft.currentlyListed && nft.owner !== (user?.userName || user?.walletAddress) && (
                <div className="not-available-tag text-red-500 font-bold mt-2">NFT is not available to buy</div>
              )}
            </div>
            <div className="text-center text-primary mt-2">{buyResult}</div>
          </div>
        </div>
        {/* Vertical Divider */}
        <div className="w-[2px] bg-white/20 min-h-[500px] mx-4 rounded-full self-stretch" />
        {/* Right: NFT Image */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-4 md:p-6 flex items-center justify-center max-w-xl w-full h-auto md:h-[850px]">
            <img src={`https://${nft.imageUrl}`} alt="NFT" className="rounded-2xl w-full h-auto max-h-[400px] md:max-h-[850px] object-cover" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NFT;