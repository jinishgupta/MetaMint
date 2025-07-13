import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import { fetchProfile, updateProfile, changePassword } from "../store/authSlice";
import { NFTcontract } from "../contracts";
import NFTCard from "../components/NFTCard";
import { fetchDataByName } from '../store/ipfsSlice';

function Profile() {
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const { profile, profileLoading, profileError, updateProfileLoading, updateProfileError, passwordChangeLoading, passwordChangeError, passwordChangeSuccess } = useSelector((state) => state.auth);

  // Local state for forms
  const [editUsername, setEditUsername] = useState("");
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editProfilePicPreview, setEditProfilePicPreview] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [activeTab, setActiveTab] = useState('settings');
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [ownedLoading, setOwnedLoading] = useState(false);
  const [ownedError, setOwnedError] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [favoritedNfts, setFavoritedNfts] = useState([]);
  const [favoritedNftData, setFavoritedNftData] = useState([]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.userName || "");
      setEditProfilePicPreview(profile.profilePicture || null); // Always use backend value
    }
  }, [profile]);

  useEffect(() => {
    const saved = localStorage.getItem('walletAddress');
    if (saved) setWalletAddress(saved);
  }, []);

  // Fetch favorited NFTs on mount
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoritedNfts') || '[]');
    setFavoritedNfts(favs);
    const fetchFavs = async () => {
      if (!favs.length) {
        setFavoritedNftData([]);
        return;
      }
      try {
        const results = await Promise.all(
          favs.map(async (name) => {
            const res = await dispatch(fetchDataByName(name));
            const files = res.payload;
            if (Array.isArray(files) && files.length > 0) {
              const file = files[0];
              if (file && file.url) {
                const metaRes = await fetch(file.url);
                const meta = await metaRes.json();
                meta.id = file.id;
                meta.cid = file.cid;
                return meta;
              }
            }
            return null;
          })
        );
        setFavoritedNftData(results.filter(Boolean));
      } catch (err) {
        setFavoritedNftData([]);
      }
    };
    fetchFavs();
    // eslint-disable-next-line
  }, []);

  const ownedNFTs = async () => {
    try {
      setOwnedLoading(true);
      setOwnedError(null);
      
      // Check if wallet is connected
      const walletAddress = localStorage.getItem('walletAddress');
      if (!window.ethereum || !walletAddress) {
        setOwnedError("Please connect your wallet first!");
        setOwnedLoading(false);
        return;
      }

      const nfts = await NFTcontract.getMyNFTs();
      // Parse NFT metadata like HomePage
      const nftDetails = await Promise.all(
        nfts.map(async (nft) => {
          const tokenURI = nft.tokenURI?.toString?.() || nft.tokenURI;
          let metadata = null;
          if (tokenURI) {
            let url = tokenURI;
            url = `https://${tokenURI}`;
            try {
              const resp = await fetch(url);
              console.log(resp);
              metadata = await resp.json();
            } catch (err) {
              metadata = null;
            }
          }
          return {
            ...nft,
            tokenURI,
            metadata,
          };
        })
      );
      setOwnedNfts(nftDetails);
    } catch (error) {
      setOwnedError("Failed to fetch owned NFTs: " + error.message);
      setOwnedNfts([]);
    } finally {
      setOwnedLoading(false);
    }
  };

  // Call ownedNFTs when tab is switched to 'owned'
  useEffect(() => {
    if (activeTab === 'owned') {
      ownedNFTs();
    }
  }, [activeTab]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (editUsername) formData.append("userName", editUsername);
    if (editProfilePic) formData.append("profilePicture", editProfilePic);
    await dispatch(updateProfile(formData));
    // Always fetch latest profile after update to ensure UI is in sync
    dispatch(fetchProfile());
    setEditProfilePicPreview(null); // Clear preview so backend value is used
    setEditProfilePic(null);
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    dispatch(changePassword(passwords));
  };

  // Handle profile pic preview
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setEditProfilePic(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditProfilePicPreview(profile?.profilePicture || null);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-wrap justify-center gap-20 p-12 max-w-[1400px] mx-auto relative z-[1] min-h-screen">
        {/* Profile Card (left) */}
        <div className="flex flex-col items-center min-w-[420px] max-w-[420px] mt-32">
          <div className="flex flex-col bg-[rgba(22,23,27,0.85)] backdrop-blur-[30px] border-2 border-gray-500 rounded-3xl w-full shadow-2xl overflow-hidden p-14 text-center mt-8">
            <div className="relative flex justify-center items-center mb-10">
              <div className="bg-gradient-to-br from-primary to-secondary w-[170px] h-[170px] rounded-full flex items-center justify-center text-7xl font-extrabold text-white">
                {editProfilePicPreview ? (
                  <img src={editProfilePicPreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : profile?.profilePicture ? (
                  <img src={profile.profilePicture + `?cb=${profile.updatedAt || Date.now()}`}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{profile?.userName ? profile.userName[0].toUpperCase() : "U"}</span>
                )}
                {/* Pen Icon Overlay - inside border */}
                <button
                  type="button"
                  className="absolute bottom-4 ml-32 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all z-20"
                  style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => fileInputRef.current.click()}
                  aria-label="Change profile picture"
                >
                  <svg width="26" height="26" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.25 8.25a2 2 0 0 1-.878.513l-3 1a1 1 0 0 1-1.263-1.263l1-3a2 2 0 0 1 .513-.878l8.25-8.25ZM15 5l-1-1" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 text-base font-semibold mb-2">Username</label>
              <div className="text-3xl font-extrabold text-white">{profile?.userName || "Username"}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 text-base font-semibold mb-2">Email</label>
              <div className="text-xl text-gray-300">{profile?.email || "No Email"}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 text-base font-semibold mb-2">Wallet Address</label>
              <div className="text-xl text-gray-300">{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not Connected"}</div>
            </div>
          </div>
        </div>
        {/* Main Area (right) */}
        <div className="flex-[1_1_600px] max-w-[900px] w-full p-8 flex flex-col items-start">
          {/* Tab Switcher */}
          <div className="flex justify-center gap-4 mb-8 w-full">
            <button
              className={`px-8 py-3 rounded-full font-bold text-base transition-all border-2 ${activeTab === 'settings' ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary' : 'bg-transparent text-primary border-primary'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button
              className={`px-8 py-3 rounded-full font-bold text-base transition-all border-2 ${activeTab === 'owned' ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary' : 'bg-transparent text-primary border-primary'}`}
              onClick={() => setActiveTab('owned')}
            >
              Owned NFTs
            </button>
            <button
              className={`px-8 py-3 rounded-full font-bold text-base transition-all border-2 ${activeTab === 'favorites' ? 'bg-gradient-to-r from-primary to-secondary text-white border-primary' : 'bg-transparent text-primary border-primary'}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorite NFTs
            </button>
          </div>
          {/* Tab Content */}
          {activeTab === 'settings' && (
            <div className="w-full bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border border-gray-600 rounded-2xl p-10 shadow-xl mb-8">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Settings</h2>
              {/* Profile Update Form */}
              <form className="mb-10" onSubmit={handleProfileUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="rounded-lg px-4 py-2 text-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Email</label>
                  <input
                    type="text"
                    value={profile?.email || ''}
                    disabled
                    className="rounded-lg px-4 py-2 text-lg bg-gray-800 text-gray-400 border border-gray-600 w-full cursor-not-allowed"
                  />
                </div>
                {updateProfileError && <div className="text-red-400 mb-2">{updateProfileError}</div>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-full shadow-md mt-2"
                  disabled={updateProfileLoading}
                >
                  {updateProfileLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
              {/* Password Change Form */}
              <form onSubmit={handlePasswordChange} className="mb-8">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Change Password</h3>
                <div className="mb-4">
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                    className="rounded-lg px-4 py-2 text-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 text-xs font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    className="rounded-lg px-4 py-2 text-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 text-xs font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword || ''}
                    onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="rounded-lg px-4 py-2 text-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  />
                </div>
                {passwordChangeError && <div className="text-red-400 mb-2">{passwordChangeError}</div>}
                {passwordChangeSuccess && <div className="text-green-400 mb-2">{passwordChangeSuccess}</div>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-full shadow-md mt-2"
                  disabled={passwordChangeLoading}
                >
                  {passwordChangeLoading ? "Changing..." : "Change Password"}
                </button>
              </form>
              {/* Loading/Error States */}
              {profileLoading && <div className="text-blue-400">Loading profile...</div>}
              {profileError && <div className="text-red-400">{profileError}</div>}
            </div>
          )}
          {activeTab === 'owned' && (
            <div className="w-full bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border border-gray-600 rounded-2xl p-10 shadow-xl mb-8 min-h-[300px] flex flex-col items-center justify-center">
              {ownedLoading ? (
                <div className="text-center text-gray-400 text-lg">Loading owned NFTs...</div>
              ) : ownedError ? (
                <div className="text-center text-red-400 text-lg">{ownedError}</div>
              ) : ownedNfts.length === 0 ? (
                <div className="text-center text-gray-400 text-lg">No owned NFTs found.</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8 w-full">
                  {ownedNfts.map((nft, idx) => (
                    nft.metadata ? <NFTCard key={idx} {...nft.metadata} owner={nft.metadata.owner || nft.seller || ''} /> : null
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'favorites' && (
            <div className="w-full bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border border-gray-600 rounded-2xl p-10 shadow-xl mb-8 min-h-[300px] flex flex-col items-center justify-center">
              {favoritedNftData.length === 0 ? (
                <div className="text-center text-gray-400 text-lg">No favorited NFTs found.</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8 w-full">
                  {favoritedNftData.map((nft, idx) => (
                    <NFTCard key={idx} {...nft} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;