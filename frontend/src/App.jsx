import {Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import MintNFT from './pages/MintNFT.jsx';
import UploadNFT from './pages/UploadNFT.jsx';
import Learn from './pages/Learn.jsx';
import SearchAndSort from './pages/SearchAndSort.jsx';
import Collection from './pages/CollectionPage.jsx';
import NFT from './pages/NFTPage.jsx';
import Auction from './pages/Auction.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/mint-nft" element={<MintNFT />} />
        <Route path="/upload-nft" element={<UploadNFT />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/search-and-sort" element={<SearchAndSort/>} />
        <Route path="/collection/:collectionId" element={<Collection/>} />
        <Route path="/nft/:nftId" element={<NFT />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;