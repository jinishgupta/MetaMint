import {Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import MintNFT from './pages/MintNFT.jsx';
import Learn from './pages/Learn.jsx';
import SearchAndSort from './pages/SearchAndSort.jsx';
import Collection from './pages/CollectionPage.jsx';
import NFT from './pages/NFTPage.jsx';
import AuctionPage from './pages/AuctionPage.jsx';
import StartAuction from './pages/StartAuction.jsx'
import CheckAuth from './components/check-auth.jsx';
import { checkAuth } from './store/authSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);


  return (
    <div>
      <Routes>
        <Route path="/" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <HomePage />
          </CheckAuth>
        } />
        <Route path="/profile" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <Profile />
          </CheckAuth>
        } />
        <Route path="/login" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <Login />
          </CheckAuth>
        } />
        <Route path="/signup" element={
          <CheckAuth isAuthenticated={isAuthenticated}>
            <SignUp />
          </CheckAuth>
        } />
        <Route path="/mint-nft" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <MintNFT />
          </CheckAuth>
        } />
        <Route path="/auction" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <AuctionPage />
          </CheckAuth>
        } />
        <Route path="/start" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <StartAuction />
          </CheckAuth>
        } />
        <Route path="/search-and-sort" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <SearchAndSort />
          </CheckAuth>
        } />
        <Route path="/learn" element={
          <CheckAuth isAuthenticated={isAuthenticated}>
            <Learn />
          </CheckAuth>
        } /> 
         <Route path="/collection" element={
          <CheckAuth isAuthenticated={isAuthenticated} >
            <Collection />
          </CheckAuth>
        } />
        <Route path="/nft" element={
          <CheckAuth isAuthenticated={isAuthenticated}>
            <NFT />
          </CheckAuth>
        } />
        {/* Add more routes as needed */}
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;