import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NFTCard from '../components/NFTCard';

function Collection() {
  const location = useLocation();
  const data = location.state || {};

    return (
        <div className="">
            <Header />
            <div className="flex w-full max-w-[1400px] mx-auto mt-8 px-4 gap-8">
                {/* Left: Collection Info */}
                <div className="flex-1 max-w-xl h-[800px] bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-10 relative animate-fadeInUp">
                    <h1 className="text-[3.2rem] font-black bg-accent-gradient bg-clip-text text-transparent mb-2 tracking-tight select-none" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                        {data.name} 
                    </h1>
                    <div className="h-[4px] w-[100px] bg-accent-gradient rounded mb-8" />
                    <h2 className="text-3xl font-bold text-text-primary mb-4 mt-8">About the Collection:</h2>
                    <div className="h-[3px] w-[60px] bg-accent-gradient rounded mb-6" />
                    <p className="text-xl font-semibold text-primary mb-8">{data.description}</p>
                    <h3 className="text-2xl font-bold text-text-primary mb-6 mt-10">Details</h3>
                    <div className="bg-[rgba(22,23,27,0.5)] rounded-xl p-8">
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Created:</span>
                            <span className="text-primary">{data.date}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Floor Price:</span>
                            <span className="text-primary">{data.floor} ETH</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Total Items:</span>
                            <span className="text-primary">{data.totalItems}</span>
                        </div>
                        <div className="flex justify-between py-3 text-lg">
                            <span className="text-text-secondary">Total Volume:</span>
                            <span className="text-primary">{data.volume} ETH</span>
                        </div>
                    </div>
                </div>
                {/* Vertical Divider */}
                <div className="w-[2px] bg-white/20 min-h-[500px] mx-4 rounded-full self-stretch" />
                {/* Right: NFT Cards */}
                <div className="flex-2 min-w-[350px]">
                    <h2 className="text-2xl font-bold text-text-primary mb-8 mt-2">NFTs in the Collection</h2>
                    <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8">
                        <NFTCard />
                        <NFTCard />
                        <NFTCard />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Collection;