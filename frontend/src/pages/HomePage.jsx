import React, { useEffect, useState } from "react";
import ScrollingLayout from "../components/ScrollingLayout";
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import NFTCard from '../components/NFTCard';
import CollectionCard from '../components/CollectionCard';
import { fetchDataByGroup } from "../store/ipfsSlice.js";
import { useDispatch } from "react-redux";

const categories = [
  { label: "ALL", value: "all" },
  { label: "ART", value: "art" },
  { label: "GAMING", value: "gaming" },
  { label: "PFPS", value: "pfp" },
  { label: "PHOTOGRAPHY", value: "photography" },
];

const ids = [
  { label: "art-nft", value: "9b963d00-6a5e-4f88-81dc-db2d85d60740" },
  { label: "gaming-nft", value: "42430137-8d98-4c93-9d46-2828989b4619" },
  { label: "pfp-nft", value: "74db4341-87ce-4524-9392-897f03d06dd1" },
  { label: "photography-nft", value: "63de8052-6580-4731-ab47-6d46e0a3e8ba" },
  { label: "art-collection", value: "e3268fb7-1445-404f-a32b-7e69f98c92d5" },
  { label: "gaming-collection", value: "c05915ab-a37a-4f38-a794-6197b2299167" },
  { label: "pfp-collection", value: "1a5190f2-45b7-4fda-93d6-7a8e1762e717" },
  { label: "photography-collection", value: "1a5190f2-45b7-4fda-93d6-7a8e1762e717" },
]

function getRandomItems(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function HomePage() {
  const [selected, setSelected] = useState("all");
  const [nftData, setNftData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allRandomNfts, setAllRandomNfts] = useState([]);
  const [artRandomNfts, setArtRandomNfts] = useState([]);
  const [gamingRandomNfts, setGamingRandomNfts] = useState([]);
  const [pfpRandomNfts, setPfpRandomNfts] = useState([]);
  const [photoRandomNfts, setPhotoRandomNfts] = useState([]);
  const [topCollections, setTopCollections] = useState([]);
  const dispatch = useDispatch();

  // Set selected category from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && categories.some(cat => cat.value === hash)) {
      setSelected(hash);
    }
  }, []);

  // Update URL hash when selected changes
  useEffect(() => {
    if (selected) {
      window.location.hash = selected;
    }
  }, [selected]);

  useEffect(() => {
    const fetchAndParse = async () => {
      setLoading(true);
      setError(null);
      setNftData([]);
      setCollectionData([]);
      setAllRandomNfts([]);
      setArtRandomNfts([]);
      setGamingRandomNfts([]);
      setPfpRandomNfts([]);
      setPhotoRandomNfts([]);
      setTopCollections([]);
      try {
        if (selected && selected !== 'all') {
          const nftIdObj = ids.find(id => id.label === `${selected}-nft`);
          const collectionIdObj = ids.find(id => id.label === `${selected}-collection`);
          if (nftIdObj && collectionIdObj) {
            const fetchNft = dispatch(fetchDataByGroup(nftIdObj.value)).unwrap();
            const fetchCollection = dispatch(fetchDataByGroup(collectionIdObj.value)).unwrap();
            const [nftRes, collectionRes] = await Promise.all([fetchNft, fetchCollection]);
            const nftMeta = await Promise.all(
              (nftRes || []).map(async (file) => {
                try {
                  if (!file || !file.url || !file.id) return null;
                  const resp = await fetch(file.url);
                  if (!resp.ok) throw new Error('Failed to fetch NFT metadata');
                  const meta = await resp.json();
                  meta.id = file.id;
                  meta.cid = file.cid;
                  return meta;
                } catch (err) {
                  return null;
                }
              })
            );
            const collectionMeta = await Promise.all(
              (collectionRes || []).map(async (file) => {
                try {
                  if (!file || !file.url || !file.id) return null;
                  const resp = await fetch(file.url);
                  if (!resp.ok) throw new Error('Failed to fetch Collection metadata');
                  const meta = await resp.json();
                  meta.id = file.id;
                  meta.cid = file.cid;
                  return meta;
                } catch (err) {
                  return null;
                }
              })
            );
            setNftData(nftMeta.filter(Boolean));
            setCollectionData(collectionMeta.filter(Boolean));
          }
        } else if (selected === 'all') {
          // Fetch all NFTs for all categories
          const nftFetches = ['art', 'gaming', 'pfp', 'photography'].map(cat => {
            const nftIdObj = ids.find(id => id.label === `${cat}-nft`);
            return nftIdObj ? dispatch(fetchDataByGroup(nftIdObj.value)).unwrap() : Promise.resolve([]);
          });
          // Fetch all collections for all categories
          const collectionFetches = ['art', 'gaming', 'pfp', 'photography'].map(cat => {
            const collectionIdObj = ids.find(id => id.label === `${cat}-collection`);
            return collectionIdObj ? dispatch(fetchDataByGroup(collectionIdObj.value)).unwrap() : Promise.resolve([]);
          });
          const [nftResults, collectionResults] = await Promise.all([
            Promise.all(nftFetches),
            Promise.all(collectionFetches)
          ]);
          const [artNfts, gamingNfts, pfpNfts, photoNfts] = nftResults;
          const [artCollections, gamingCollections, pfpCollections, photoCollections] = collectionResults;
          // Parse all NFTs
          const parseNfts = async (files) => {
            return await Promise.all(
              (files || []).map(async (file) => {
                try {
                  if (!file || !file.url || !file.id) return null;
                  const resp = await fetch(file.url);
                  if (!resp.ok) throw new Error('Failed to fetch NFT metadata');
                  const meta = await resp.json();
                  meta.id = file.id;
                  meta.cid = file.cid;
                  return meta;
                } catch (err) {
                  return null;
                }
              })
            );
          };
          // Parse all collections
          const parseCollections = async (files) => {
            return await Promise.all(
              (files || []).map(async (file) => {
                try {
                  if (!file || !file.url || !file.id) return null;
                  const resp = await fetch(file.url);
                  if (!resp.ok) throw new Error('Failed to fetch Collection metadata');
                  const meta = await resp.json();
                  meta.id = file.id;
                  meta.cid = file.cid;
                  return meta;
                } catch (err) {
                  return null;
                }
              })
            );
          };
          const [artMeta, gamingMeta, pfpMeta, photoMeta] = await Promise.all([
            parseNfts(artNfts),
            parseNfts(gamingNfts),
            parseNfts(pfpNfts),
            parseNfts(photoNfts)
          ]);
          const [artColMeta, gamingColMeta, pfpColMeta, photoColMeta] = await Promise.all([
            parseCollections(artCollections),
            parseCollections(gamingCollections),
            parseCollections(pfpCollections),
            parseCollections(photoCollections)
          ]);
          // All NFTs combined
          const allNfts = [...artMeta, ...gamingMeta, ...pfpMeta, ...photoMeta].filter(Boolean);
          setAllRandomNfts(getRandomItems(allNfts, 8));
          setArtRandomNfts(getRandomItems(artMeta.filter(Boolean), 8));
          setGamingRandomNfts(getRandomItems(gamingMeta.filter(Boolean), 8));
          setPfpRandomNfts(getRandomItems(pfpMeta.filter(Boolean), 8));
          setPhotoRandomNfts(getRandomItems(photoMeta.filter(Boolean), 8));
          // All collections combined
          const allCollections = [...artColMeta, ...gamingColMeta, ...pfpColMeta, ...photoColMeta].filter(Boolean);
          setTopCollections(getRandomItems(allCollections, 8));
        }
      } catch (err) {
        setError('Failed to fetch NFT or Collection data');
      } finally {
        setLoading(false);
      }
    };
    fetchAndParse();
  }, [selected, dispatch]);

  return (
    <div>
      <Header />
        <div className="px-8 pt-8 pb-2">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-1">Discover Unique Digital Art</h2>
          <p className="text-gray-300 text-base mb-6">Explore the world's finest NFT collections and connect with artists worldwide</p>
          <div className="flex gap-6 items-center justify-center mt-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelected(cat.value)}
                className={`px-7 py-2 rounded-full font-bold text-base transition-all border-none outline-none
                  ${selected === cat.value
                    ? "bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md"
                    : "bg-transparent text-gray-300 border border-gray-700 hover:bg-gray-800 hover:text-white"}
                `}
                style={{ letterSpacing: "0.05em" }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        {loading && <div className="text-center text-white mt-8">Loading...</div>}
        {error && <div className="text-center text-red-400 mt-8">{error}</div>}
        {/* Top Collections Section (for ALL) */}
        {selected === 'all' && topCollections.length > 0 && (
          <ScrollingLayout
            heading="Top Collections"
            items={topCollections}
            renderItem={(item, idx) => (
              <CollectionCard key={idx} {...item} />
            )}
          />
        )}
        {/* All NFTs Section (for ALL) */}
        {selected === 'all' && allRandomNfts.length > 0 && (
          <ScrollingLayout
            heading="Top NFTs"
            items={allRandomNfts}
            renderItem={(item, idx) => (
              <NFTCard key={idx} {...item} />
            )}
          />
        )}
        {/* Art NFTs Section (for ALL) */}
        {selected === 'all' && artRandomNfts.length > 0 && (
          <ScrollingLayout
            heading="Top Art NFTs"
            items={artRandomNfts}
            renderItem={(item, idx) => (
              <NFTCard key={idx} {...item} />
            )}
          />
        )}
        {/* Gaming NFTs Section (for ALL) */}
        {selected === 'all' && gamingRandomNfts.length > 0 && (
          <ScrollingLayout
            heading="Top Gaming NFTs"
            items={gamingRandomNfts}
            renderItem={(item, idx) => (
              <NFTCard key={idx} {...item} />
            )}
          />
        )}
        {/* PFP NFTs Section (for ALL) */}
        {selected === 'all' && pfpRandomNfts.length > 0 && (
          <ScrollingLayout
            heading="Top PFP NFTs"
            items={pfpRandomNfts}
            renderItem={(item, idx) => (
              <NFTCard key={idx} {...item} />
            )}
          />
        )}
        {/* Photography NFTs Section (for ALL) */}
        {selected === 'all' && photoRandomNfts.length > 0 && (
          <ScrollingLayout
            heading="Top Photography NFTs"
            items={photoRandomNfts}
            renderItem={(item, idx) => (
              <NFTCard key={idx} {...item} />
            )}
          />
        )}
        {/* Collection Section (for category) */}
        {selected !== 'all' && collectionData.length > 0 && (
          <ScrollingLayout
            heading={`Top ${categories.find(c => c.value === selected)?.label} Collections`}
            items={collectionData}
            renderItem={(item, idx) => (
              <CollectionCard key={idx} {...item} />
            )}
          />
        )}
        {/* NFT Section (for category) */}
       {selected !== 'all' && nftData.length > 0 && (
          <ScrollingLayout
            heading={`Top ${categories.find(c => c.value === selected)?.label} NFTs`}
            items={nftData}
            renderItem={(item, idx) => (
              <NFTCard key={idx} {...item} />
            )}
          />
        )}
      <Footer />
    </div>
  );
}

export default HomePage;