import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { uploadData, uploadImage } from '../store/ipfsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { NFTcontract } from '../contracts';
import { fetchDataByName } from '../store/ipfsSlice';

function MintNFT() {
    const [collectionType, setCollectionType] = useState('new');
    const user = useSelector(state => state.auth.user);
    const [collectionData, setCollectionData] = useState({
        category: "",
        name: "",
        description: "",
        type:"collection",
        date:"",
        floor:"",
        volume:"",
        items:"1",
        id:"",
        nfts:[]
    });
    const [nftData, setNftData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        type:"nft",
        owner: user.userName,
        views: 0,
        favorites: 0,
        id:""
    })
    const [nftImage, setNftImage] = useState(null);
    const [minting, setMinting] = useState(false);
    const [mintResult, setMintResult] = useState("");
    const dispatch = useDispatch();
    const GATEWAY_URL = 'white-generous-iguana-225.mypinata.cloud';
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNftImage(file);
    };

    const handleCollectionChange = (e) => {
        const { id, value } = e.target;
        setCollectionData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleNFTChange = (e) => {
        const { id, value } = e.target;
        setNftData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMintResult("");

        // Basic validation
        if (!nftData["name"] || !nftImage) {group
            setMintResult("NFT name and image are required.");
            return;
        }
        if (collectionType === "new" && (!collectionData["name"] || !collectionData["category"] || !collectionData["description"])) {
            setMintResult("Please fill all new collection fields.");
            return;
        }

        setMinting(true);
        setMintResult("Getting current token ID...");
        try {
            // Check if wallet is connected
            const walletAddress = localStorage.getItem('walletAddress');
            if (!window.ethereum || !walletAddress) {
                setMintResult("Please connect your wallet first!");
                setMinting(false);
                return;
            }

            // Get the current token ID before minting
            const currentTokenId = await NFTcontract.getCurrentToken();
            const nextTokenId = currentTokenId + 1n; // The next token ID that will be assigned (BigInt)
            
            setMintResult("Uploading image to IPFS...");
            // 1. Upload image and wait for result
            const imageResult = await dispatch(uploadImage(nftImage)).unwrap();
            if (!imageResult.success) {
                setMintResult("Image upload failed: " + (imageResult.message || "Unknown error"));
                return;
            }
            // 2. Upload collection metadata or update existing collection
            const imageUrl = imageResult.imageUrl;
            let metaToUpload;
            if (collectionType === "new") {
                collectionData["floor"] = nftData["price"];
                collectionData["volume"] = nftData["price"];
                collectionData["nfts"].push(nftData["name"]);
                const now = new Date();
                const options = { day: '2-digit', month: 'long', year: 'numeric' };
                collectionData["date"] = now.toLocaleDateString('en-GB', options);
                metaToUpload = { ...collectionData, imageUrl: imageUrl };
                setMintResult("Uploading collection metadata to IPFS...");
                const collectionResult = await dispatch(uploadData(metaToUpload)).unwrap();
                if(collectionResult.success) {
                    setMintResult("Collection created successfully");
                } else {
                    setMintResult(collectionResult.message || "Collection Metadata upload failed");
                }
            } else if (collectionType === "existing") {
                setMintResult("Fetching existing collection...");
                // 1. Find collection by name
                const collectionName = document.getElementById("existingCollection-id").value.trim();
                if (!collectionName) {
                  setMintResult("Please enter the existing collection name.");
                  setMinting(false);
                  return;
                }
                // Fetch collection metadata URL(s) and id(s)
                const res = await dispatch(fetchDataByName(collectionName));
                const files = res.payload;
                if (!files || files.length === 0) {
                  setMintResult("Collection not found.");
                  setMinting(false);
                  return;
                }
                // Use the first result (assume unique name)
                const file = files[0];
                const url = file.url;
                const id = file.id;
                const resp = await fetch(url);
                const collectionMeta = await resp.json();
                // 2. Update collection fields
                const newPrice = parseFloat(nftData.price);
                const oldFloor = parseFloat(collectionMeta.floor) || newPrice;
                const oldVolume = parseFloat(collectionMeta.volume) || 0;
                const oldItems = parseInt(collectionMeta.items) || 0;
                const nfts = Array.isArray(collectionMeta.nfts) ? [...collectionMeta.nfts] : [];
                nfts.push(nftData.name);
                const updatedCollection = {
                  ...collectionMeta,
                  floor: oldFloor > newPrice ? newPrice : oldFloor,
                  volume: (oldVolume + newPrice).toString(),
                  items: (oldItems + 1).toString(),
                  nfts,
                };
                // 3. Update on Pinata
                setMintResult("Updating collection metadata on Pinata...");
                const updateRes = await fetch('http://localhost:4000/api/update-pinata', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ id, updatedData: updatedCollection }),
                }).then(r => r.json());
                if (!updateRes.success) {
                  setMintResult('Failed to update collection: ' + (updateRes.message || 'Unknown error'));
                  setMinting(false);
                  return;
                }
            }
            // 3. Upload NFT metadata with tokenId
            const nftDataWithTokenId = { 
                ...nftData, 
                imageUrl: imageUrl,
                tokenId: nextTokenId.toString() // Store the tokenId in the metadata as string
            };
            const nftResult = await dispatch(uploadData(nftDataWithTokenId)).unwrap();
            if (nftResult.success) {
                // Call smart contract mintNFT
                const tokenURI = nftResult.metadataUrl;
                if (!tokenURI) {
                  setMintResult("NFT metadata upload succeeded but no CID returned.");
                  return;
                }
                setMintResult("Minting NFT on blockchain...");
                // Convert price to wei (ethers.js v6+)
                const priceEth = nftData.price;
                let priceWei;
                try {
                  priceWei = window.ethers ? window.ethers.parseEther(priceEth) : (parseFloat(priceEth) * 1e18).toString();
                } catch (err) {
                  priceWei = (parseFloat(priceEth) * 1e18).toString();
                }
                // Get list price from contract
                let listPrice = "0";
                try {
                  listPrice = (await NFTcontract.getListPrice()).toString();
                } catch (err) {
                  // fallback to 0
                }
                try {
                  const tx = await NFTcontract.mintNFT(tokenURI, priceWei, { value: listPrice });
                  setMintResult("Waiting for transaction confirmation...");
                  await tx.wait();
                  setMintResult("NFT Minted successfully on blockchain!");
                } catch (err) {
                  setMintResult("Blockchain mint failed: " + (err.message || err));
                  return;
                }
            } else {
                setMintResult(nftResult.message || "NFT Metadata upload failed");
            }
        } catch (err) {
            console.log(err);
            setMintResult("Minting failed: " + (err.message || err));
        } finally {
            setMinting(false);
        }
    };

    return (
        <div>
            <Header />
            <div
                className="relative z-[1] mx-auto my-12 max-w-[900px] rounded-2xl shadow-xl bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border p-12 animate-fadeInUp"
            >
                {/* Shimmer line at top */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-gradient transition-transform origin-left scale-x-0 hover:scale-x-100 duration-300" />

                {/* Section Title */}
                <h1 className="relative text-center text-[3rem] font-black bg-accent-gradient bg-clip-text text-transparent mb-8 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Mint Your NFT
                    <span className="block absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-[100px] h-1 bg-accent-gradient rounded" aria-hidden="true"></span>
                </h1>

                {/* Collection Selection */}
                <div className="flex flex-wrap gap-4 my-4 p-6 bg-[rgba(22,23,27,0.5)] rounded-xl border border-border" id="collection-selection">
                    <label className="inline-flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,220,130,0.05)] border border-[rgba(0,220,130,0.1)] cursor-pointer font-medium text-text-secondary hover:bg-[rgba(0,220,130,0.1)] hover:text-primary transition-all">
                        <input type="radio" name="collection-type" value="new" defaultChecked={collectionType === 'new'} onChange={() => setCollectionType('new')} className="accent-primary" />
                        Create New Collection
                    </label>
                    <label className="inline-flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,220,130,0.05)] border border-[rgba(0,220,130,0.1)] cursor-pointer font-medium text-text-secondary hover:bg-[rgba(0,220,130,0.1)] hover:text-primary transition-all">
                        <input type="radio" name="collection-type" value="existing" checked={collectionType === 'existing'} onChange={() => setCollectionType('existing')} className="accent-primary" />
                        Add to Existing Collection
                    </label>
                </div>

                {/* New Collection Section */}
                {collectionType === 'new' && (
                    <div className="form-group bg-[rgba(22,23,27,0.5)] p-6 rounded-xl border border-border mb-6 transition-all hover:border-primary hover:bg-[rgba(22,23,27,0.7)]">
                        <h2 className="relative text-[2rem] font-bold bg-accent-gradient bg-clip-text text-transparent mt-8 mb-6 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            New Collection Metadata
                            <span className="block absolute left-0 bottom-[-8px] w-[60px] h-[3px] bg-accent-gradient rounded" aria-hidden="true"></span>
                        </h2>
                        {[
                            { id: "category", label: "Category of the collection :", placeholder: "Category" },
                            { id: "name", label: "Name of the collection :", placeholder: "Collection Name" },
                            { id: "description", label: "Description of the collection :", placeholder: "Collection Description" },
                        ].map(({ id, label, placeholder }) => (
                            <div key={id} className="mb-6">
                                <label htmlFor={id} className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">{label}</label>
                                <input type="text" id={id} placeholder={placeholder}
                                    className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleCollectionChange} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Existing Collection Section */}
                {collectionType === 'existing' && (
                    <div className="form-group bg-[rgba(22,23,27,0.5)] p-6 rounded-xl border border-border mb-6 transition-all hover:border-primary hover:bg-[rgba(22,23,27,0.7)]">
                        <h2 className="relative text-[2rem] font-bold bg-accent-gradient bg-clip-text text-transparent mt-8 mb-6 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Existing Collection Info
                            <span className="block absolute left-0 bottom-[-8px] w-[60px] h-[3px] bg-accent-gradient rounded" aria-hidden="true"></span>
                        </h2>
                        <div className="mb-6">
                            <label htmlFor="existingCollection-id" className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">Name of the collection :</label>
                            <input type="text" id="existingCollection-id" placeholder="Collection Name"
                                className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" />
                        </div>
                    </div>
                )}

                {/* NFT Minting Section */}
                <div className="form-group bg-[rgba(22,23,27,0.5)] p-6 rounded-xl border border-border mb-6 transition-all hover:border-primary hover:bg-[rgba(22,23,27,0.7)]">
                    <h2 className="relative text-[2rem] font-bold bg-accent-gradient bg-clip-text text-transparent mt-8 mb-6 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Mint NFT
                        <span className="block absolute left-0 bottom-[-8px] w-[60px] h-[3px] bg-accent-gradient rounded" aria-hidden="true"></span>
                    </h2>
                    {[
                        { id: "name", label: "Name :", placeholder: "NFT Name" },
                        { id: "category", label: "Category of the NFT :", placeholder: "Category" },
                        { id: "description", label: "Description :", placeholder: "NFT Description" },
                        { id: "price", label: "Price :", placeholder: "Price (ETH)" },
                    ].map(({ id, label, placeholder }) => (
                        <div key={id} className="mb-6">
                            <label htmlFor={id} className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">{label}</label>
                            <input type="text" id={id} placeholder={placeholder}
                                className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" onChange={handleNFTChange} />
                        </div>
                    ))
                    }
                    <div>
                        <label htmlFor="nft-file" className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">NFT File:</label>
                        <input type="file" id="nft-file" onChange={handleImageChange}
                            className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" />
                    </div>
                    <button
                        id="mint-button"
                        onClick={handleSubmit}
                        className="bg-accent-gradient text-background border-none py-4 px-8 rounded-xl text-[1.1rem] font-bold cursor-pointer block mx-auto mt-8 text-center transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow" disabled={minting}
                    >
                        Mint NFT
                    </button>
                    <div>
                        {mintResult}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MintNFT;