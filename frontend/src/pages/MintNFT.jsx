import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { uploadData, uploadImage } from '../store/ipfsSlice';
import { useDispatch } from 'react-redux';

function MintNFT() {
    const [collectionType, setCollectionType] = useState('new');
    const [collectionData, setCollectionData] = useState({
        category: "",
        name: "",
        description: "",
        type:"collection"
    });
    const [nftData, setNftData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        type:"nft",
        views: 0,
        favorites: 0
    })
    const [nftImage, setNftImage] = useState(null);
    const [minting, setMinting] = useState(false);
    const [mintResult, setMintResult] = useState("");
    const dispatch = useDispatch();

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
        if (!nftData["name"] || !nftImage) {
            setMintResult("NFT name and image are required.");
            return;
        }
        if (collectionType === "new" && (!collectionData["name"] || !collectionData["category"] || !collectionData["description"])) {
            setMintResult("Please fill all new collection fields.");
            return;
        }

        setMinting(true);
        setMintResult("Uploading image to IPFS...");
        try {
            // 1. Upload image and wait for result
            const imageResult = await dispatch(uploadImage(nftImage)).unwrap();
            if (!imageResult.success) {
                setMintResult("Image upload failed: " + (imageResult.message || "Unknown error"));
                return;
            }
            // 2. Add imageUrl to metadata
            const imageUrl = imageResult.imageUrl;
            let metaToUpload;
            if (collectionType === "new") {
                metaToUpload = { ...collectionData, imageUrl: imageUrl };
                setMintResult("Uploading collection metadata to IPFS...");
                const collectionResult = await dispatch(uploadData(metaToUpload)).unwrap();
                if(collectionResult.success) {
                    setMintResult("Collection created successfully");
                } else {
                    setMintResult(collectionResult.message || "Collection Metadata upload failed");
                }
            } else {
            }
            // 3. Upload metadata
            metaToUpload = { ...nftData, imageUrl: imageUrl };
            const nftResult = await dispatch(uploadData(metaToUpload)).unwrap();
            setMintResult("Uploading NFT metadata to IPFS...");
            if (nftResult.success) {
                setMintResult("NFT Minted successfully!" );
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