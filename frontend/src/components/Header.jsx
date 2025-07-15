import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faUserRegular } from "@fortawesome/free-regular-svg-icons";
import mintbitLogo from '../assets/mintbit-brands.svg';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {logoutUser} from '../store/authSlice.js';
import React, { useState, useEffect } from 'react';

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {isAuthenticated} = useSelector((state) => state.auth);
    const [walletAddress, setWalletAddress] = useState("");

    // On mount, check for wallet in localStorage
    useEffect(() => {
      const saved = localStorage.getItem('walletAddress');
      if (saved) setWalletAddress(saved);
      // Listen for account changes
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            localStorage.setItem('walletAddress', accounts[0]);
          } else {
            setWalletAddress("");
            localStorage.removeItem('walletAddress');
          }
        });
      }
    }, []);

    // Connect wallet function
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
        } catch (err) {
          alert('Wallet connection failed!');
        }
      } else {
        alert('Please install MetaMask!');
      }
    };
    
    const handleLogOut = () => {
        dispatch(logoutUser());
        navigate('/login');
    }

    return (
        <div>
            <style>{`
                .logo-flip {
                    transform: scaleX(-1);
                    transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
                }
                .logo-flip-wrapper:hover .logo-flip {
                    transform: scaleX(1);
                }
            `}</style>
            <div className="bg-[rgba(22,23,27,0.92)] backdrop-blur-[30px] border-b-2 border-[rgba(255,255,255,0.1)] px-8 py-2 min-h-[64px] h-[64px] flex items-center justify-between rounded-b-[24px] shadow-[0_2px_12px_0_rgba(0,0,0,0.08)] sticky top-0 z-[1000] transition-all duration-300 hover:bg-[rgba(22,23,27,0.95)]">
                {/* Logo Section */}
                <div className="flex items-center gap-3 h-12">
                    <div className="logo-flip-wrapper w-10 h-10 flex items-center justify-center select-none cursor-pointer">
                        <img 
                            src={mintbitLogo} 
                            alt="Mintbit Logo" 
                            className="logo-flip w-10 h-10"
                            style={{
                                filter: 'drop-shadow(0 0 10px #00ffa3) drop-shadow(0 0 20px #1e3a8a)'
                            }}
                        />
                    </div>
                    <p onClick={() => navigate('/')}  className="text-4xl font-black bg-gradient-to-r from-green-400 to-blue-800 bg-clip-text text-transparent tracking-tight leading-none hover:scale-105 hover:bg-gradient-to-r hover:from-green-400 hover:to-blue-800 transition-transform duration-300">MetaMint</p>
                </div>

                {/* Search Section */}
                <div className="flex-1 flex items-center justify-center max-w-[400px] mx-6 h-12">
                   <form
                     className="w-full"
                     onSubmit={e => {
                       e.preventDefault();
                       const value = e.target.elements.searchInput.value.trim();
                       if (value) {
                         navigate(`/search-and-sort?query=${encodeURIComponent(value)}`);
                       } else {
                         navigate('/search-and-sort');
                       }
                     }}
                   >
                    <input 
                         name="searchInput"
                        placeholder="Search NFTs..."
                        className="w-full px-4 py-2 bg-surface-light border-2 border-border rounded-lg text-text-primary text-base transition-all duration-300 h-10 flex items-center placeholder-text-muted font-normal focus:outline-none focus:border-green-400 focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-102"
                         autoComplete="off"
                    />
                   </form>
                </div>

                {/* Navigation Items */}
                <div className="flex items-center gap-5 h-12">
                    <p
                        className="text-gray-500 font-semibold px-4 py-2 rounded-lg transition-all flex items-center h-10 hover:text-green-400 hover:bg-white/10 hover:-translate-y-0.5 relative group"
                        onClick={() => navigate('/search-and-sort/#nft')}
                    >
                        NFTs
                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-800 transition-all duration-300 transform -translate-x-1/2 group-hover:w-4/5 rounded"></span>
                    </p>
                    <p
                        className="text-gray-500 font-semibold px-4 py-2 rounded-lg transition-all flex items-center h-10 hover:text-green-400 hover:bg-white/10 hover:-translate-y-0.5 relative group"
                        onClick={() => navigate('/search-and-sort/#collection')}
                    >
                        Collections
                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-800 transition-all duration-300 transform -translate-x-1/2 group-hover:w-4/5 rounded"></span>
                    </p>
                    <p className="text-gray-500 font-semibold px-4 py-2 rounded-lg transition-all flex items-center h-10 hover:text-green-400 hover:bg-white/10 hover:-translate-y-0.5 relative group" onClick={() => navigate('/profile')}>
                        Profile
                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-800 transition-all duration-300 transform -translate-x-1/2 group-hover:w-4/5 rounded"></span>
                    </p>
                    {isAuthenticated ? 
                    <p className="text-gray-500 font-semibold px-4 py-2 rounded-lg transition-all flex items-center h-10 hover:text-green-400 hover:bg-white/10 hover:-translate-y-0.5 relative group" onClick={handleLogOut}>
                    LogOut
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-800 transition-all duration-300 transform -translate-x-1/2 group-hover:w-4/5 rounded"></span>
                    </p>
                    :<p className="text-gray-500 font-semibold px-4 py-2 rounded-lg transition-all flex items-center h-10 hover:text-green-400 hover:bg-white/10 hover:-translate-y-0.5 relative group" onClick={() => navigate('/login')}>
                        Login
                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-800 transition-all duration-300 transform -translate-x-1/2 group-hover:w-4/5 rounded"></span>
                    </p>}
                    
                    {/* Wallet Button */}
                    <button
                      className="bg-gradient-to-r from-green-400 to-blue-800 text-background border-none px-5 py-2 rounded-xl font-bold cursor-pointer transition-all duration-300 uppercase tracking-wider shadow-md h-10 flex items-center hover:border-green-400 hover:text-background hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={connectWallet}
                    >
                      {walletAddress
                        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                        : 'Connect Wallet'}
                    </button>

                    {/* User Icon & Dropdown */}
                    <div className="relative inline-block group">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-green-400 to-blue-800 flex items-center justify-center cursor-pointer transition-all duration-300 text-[1.3rem] shadow-sm hover:scale-110 hover:rotate-5 hover:shadow-md hover:shadow-green-400/20">
                            <FontAwesomeIcon icon={faUserRegular} />
                        </div>
                        <div className="absolute w-full h-3 bottom-0 translate-y-full"></div>
                        <div className="hidden group-hover:block absolute right-0 top-[calc(100%+0.75rem)] min-w-[200px] bg-surface backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl overflow-hidden animate-slideDown z-[1001]">
                            <div className="py-1">
                                <p onClick={() => navigate('/mint-nft')} className="text-text-primary px-5 py-3.5 block text-sm font-medium transition-all duration-300 border-l-3 border-transparent hover:bg-green-400 hover:text-background hover:border-l-background hover:pl-6">Mint NFTs</p>
                                <p onClick={() => navigate('/start')} className="text-text-primary px-5 py-3.5 block text-sm font-medium transition-all duration-300 border-l-3 border-transparent hover:bg-green-400 hover:text-background hover:border-l-background hover:pl-6">Start Auction</p>
                                <p onClick={() => navigate('/search-and-sort#auction')} className="text-text-primary px-5 py-3.5 block text-sm font-medium transition-all duration-300 border-l-3 border-transparent hover:bg-green-400 hover:text-background hover:border-l-background hover:pl-6">Auctions</p>
                                <p onClick={() => navigate('/learn')} className="text-text-primary px-5 py-3.5 block text-sm font-medium transition-all duration-300 border-l-3 border-transparent hover:bg-green-400 hover:text-background hover:border-l-background hover:pl-6">Learn</p>
                                <p className="text-text-primary px-5 py-3.5 block text-sm font-medium transition-all duration-300 border-l-3 border-transparent hover:bg-green-400 hover:text-background hover:border-l-background hover:pl-6">Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header;