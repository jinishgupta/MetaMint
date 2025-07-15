import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NFTcontract } from '../contracts/contracts.js';
import NFTCard from '../components/NFTCard';
import CollectionCard from '../components/CollectionCard';
import AuctionCard from '../components/AuctionCard';
import { fetchDataByGroup } from '../store/ipfsSlice';
import { useDispatch } from 'react-redux';

function SearchAndSort() {
  const location = useLocation();
  const navigate = useNavigate();
  // Get query param from URL
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [allNFTs, setAllNFTs] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [sortCriteria, setSortCriteria] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedSort, setAppliedSort] = useState({
    sortCriteria: 'none',
    sortOrder: 'asc',
    category: 'All',
  });
  const [allAuctions, setAllAuctions] = useState([]);
  // Determine what to show based on hash
  const hash = location.hash?.toLowerCase();
  const showNFTs = !hash || hash === '#nft';
  const showCollections = !hash || hash === '#collection';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all NFTs from contract
        const nfts = await NFTcontract.getAllNFTs();
        // Fetch metadata for each NFT
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
                metadata.id = metadata.id || null;
              } catch (err) {
                metadata = null;
              }
            }
            return metadata;
          })
        );
        setAllNFTs(nftDetails.filter(Boolean));

        // Fetch all collections (reuse HomePage logic)
        const ids = [
          'e3268fb7-1445-404f-a32b-7e69f98c92d5', // art-collection
          'c05915ab-a37a-4f38-a794-6197b2299167', // gaming-collection
          '1a5190f2-45b7-4fda-93d6-7a8e1762e717', // pfp-collection
          '1a5190f2-45b7-4fda-93d6-7a8e1762e717', // photography-collection
        ];
        const collectionFetches = ids.map(id => dispatch(fetchDataByGroup(id)).unwrap());
        const collectionResults = await Promise.all(collectionFetches);
        const allCollectionsMeta = await Promise.all(
          collectionResults.flat().map(async (file) => {
            try {
              if (!file || !file.url || !file.id) return null;
              const resp = await fetch(file.url);
              const meta = await resp.json();
              meta.id = file.id;
              meta.cid = file.cid;
              return meta;
            } catch (err) {
              return null;
            }
          })
        );
        setAllCollections(allCollectionsMeta.filter(Boolean));

        // Fetch all active auctions from contract
        const auctions = await NFTcontract.getActiveAuctions();
        // Fetch auction metadata for each auction
        const auctionDetails = await Promise.all(
          auctions.map(async (auction) => {
            let meta = null;
            if (auction.auctionURI) {
              try {
                const resp = await fetch(`https://${auction.auctionURI}`);
                meta = await resp.json();
              } catch (err) {
                meta = null;
              }
            }
            return {
              auctionId: auction.auctionId?.toString?.() || auction.auctionId,
              name: meta?.name || `Auction #${auction.auctionId}`,
              imageUrl: meta?.imageUrl || '',
              highestBid: auction.highestBid ? (parseFloat(auction.highestBid) / 1e18).toFixed(3) : '0',
              endTime: auction.startTime && auction.duration ? new Date((parseInt(auction.startTime) + parseInt(auction.duration)) * 1000).toLocaleString() : '',
              ...auction,
            };
          })
        );
        setAllAuctions(auctionDetails.filter(Boolean));
      } catch (err) {
        setError('Failed to fetch NFTs, collections, or auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Keep searchTerm in sync with URL query param
  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  // Filter NFTs and collections by search term and applied category
  let filteredNFTs = allNFTs.filter(nft => {
    const matchesSearch = nft?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = appliedSort.category === 'All' || (nft?.category?.toLowerCase() === appliedSort.category.toLowerCase());
    return matchesSearch && matchesCategory;
  });
  let filteredCollections = allCollections.filter(col => {
    const matchesSearch = col?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = appliedSort.category === 'All' || (col?.category?.toLowerCase() === appliedSort.category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Sort NFTs and collections only after Sort button is clicked
  if (appliedSort.sortCriteria !== 'none') {
    filteredNFTs = [...filteredNFTs].sort((a, b) => {
      if (appliedSort.sortCriteria === 'name') {
        const nameA = a?.name?.toLowerCase() || '';
        const nameB = b?.name?.toLowerCase() || '';
        if (nameA < nameB) return appliedSort.sortOrder === 'asc' ? -1 : 1;
        if (nameA > nameB) return appliedSort.sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else if (appliedSort.sortCriteria === 'price') {
        const priceA = parseFloat(a?.price) || 0;
        const priceB = parseFloat(b?.price) || 0;
        return appliedSort.sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });
    filteredCollections = [...filteredCollections].sort((a, b) => {
      if (appliedSort.sortCriteria === 'name') {
        const nameA = a?.name?.toLowerCase() || '';
        const nameB = b?.name?.toLowerCase() || '';
        if (nameA < nameB) return appliedSort.sortOrder === 'asc' ? -1 : 1;
        if (nameA > nameB) return appliedSort.sortOrder === 'asc' ? 1 : -1;
        return 0;
      } else if (appliedSort.sortCriteria === 'price') {
        const floorA = parseFloat(a?.floor) || 0;
        const floorB = parseFloat(b?.floor) || 0;
        return appliedSort.sortOrder === 'asc' ? floorA - floorB : floorB - floorA;
      }
      return 0;
    });
  }

  return (
    <div>
      <Header />
      <div className="flex min-h-[80vh] w-full mx-4">
        {/* Left Sidebar Filter Controls */}
        <div className=" w-full max-w-xs p-4 my-4 ml-0">
          {/* Shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-gradient origin-left scale-x-0 hover:scale-x-100 transition-transform duration-300" />
          <div className="filter-row flex flex-col gap-6 mb-6">
            <div className="filter-group flex flex-col min-w-[200px] flex-1">
              <label htmlFor="sort-criteria" className="text-[1.2rem] text-text-secondary font-semibold mb-2 block tracking-wide">Sort by:</label>
              <select id="sort-criteria" value={sortCriteria} onChange={e => setSortCriteria(e.target.value)} className="bg-surface-light text-text-primary text-base my-2 p-3 border-2 border-border rounded-lg transition-all cursor-pointer backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] hover:border-primary hover:bg-surface-lighter">
                <option value="none">None</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
            <div className="filter-group flex flex-col min-w-[200px] flex-1">
              <label htmlFor="sort-order" className="text-[1.2rem] text-text-secondary font-semibold mb-2 block tracking-wide">Order:</label>
              <select id="sort-order" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="bg-surface-light text-text-primary text-base my-2 p-3 border-2 border-border rounded-lg transition-all cursor-pointer backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] hover:border-primary hover:bg-surface-lighter">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="filter-group flex flex-col min-w-[200px] flex-1">
              <label htmlFor="category-filter" className="text-[1.2rem] text-text-secondary font-semibold mb-2 block tracking-wide">Category:</label>
              <select id="category-filter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-surface-light text-text-primary text-base my-2 p-3 border-2 border-border rounded-lg transition-all cursor-pointer backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] hover:border-primary hover:bg-surface-lighter">
                <option value="All">All</option>
                <option value="Art">Art</option>
                <option value="Gaming">Gaming</option>
                <option value="PFP">PFPs</option>
                <option value="Photography">Photography</option>
              </select>
            </div>
            <button
              id="sort"
              className="bg-accent-gradient text-background text-base font-bold my-2 py-3 px-6 rounded-xl border-none cursor-pointer transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-glow"
              onClick={() => setAppliedSort({ sortCriteria, sortOrder, category: selectedCategory })}
            >
              Sort
            </button>
          </div>
        </div>
        <div className="w-[2px] bg-white/20 min-h-[500px] mx-2 rounded-full self-stretch" />
        <div className='flex-grow w-full mx-10 p-4 my-4'>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              {showNFTs && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-white">NFTs</h2>
                  <div className="grid grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-8 justify-center min-h-[200px] w-full">
                    {filteredNFTs.length === 0 ? <div className='col-span-4 text-center'>No NFTs found.</div> : filteredNFTs.map((nft, idx) => (
                      <NFTCard key={idx} {...nft} />
                    ))}
                  </div>
                </>
              )}
              {/* Auctions Section */}
              {hash === '#auction' && (
                <>
                  <h2 className="text-2xl font-bold mb-4 mt-8 text-white">Auctions</h2>
                  <div className="grid grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-8 justify-center min-h-[200px] w-full">
                    {allAuctions.length === 0 ? <div className='col-span-4 text-center'>No auctions found.</div> : allAuctions.map((auction, idx) => (
                      <AuctionCard key={auction.auctionId || idx} {...auction} />
                    ))}
                  </div> 
                </>
              )}
              {showCollections && (
                <>
                  <h2 className="text-2xl font-bold mb-4 mt-8 text-white">Collections</h2>
                  <div className="grid grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-8 justify-center min-h-[200px] w-full">
                    {filteredCollections.length === 0 ? <div className='col-span-4 text-center'>No collections found.</div> : filteredCollections.map((col, idx) => (
                      <CollectionCard key={idx} {...col} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SearchAndSort;