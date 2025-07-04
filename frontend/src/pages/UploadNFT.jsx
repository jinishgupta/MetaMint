import Header from '../components/Header';
import Footer from '../components/Footer';

function UploadNFT() {
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
                    Upload Your NFT
                    <span className="block absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-[100px] h-1 bg-accent-gradient rounded" aria-hidden="true"></span>
                </h1>

                {/* Collection Selection */}
                <div className="flex flex-wrap gap-4 my-4 p-6 bg-[rgba(22,23,27,0.5)] rounded-xl border border-border" id="collection-selection">
                    <label className="inline-flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,220,130,0.05)] border border-[rgba(0,220,130,0.1)] cursor-pointer font-medium text-text-secondary hover:bg-[rgba(0,220,130,0.1)] hover:text-primary transition-all">
                        <input type="radio" name="collection-type" value="new" defaultChecked className="accent-primary" />
                        Create New Collection
                    </label>
                    <label className="inline-flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,220,130,0.05)] border border-[rgba(0,220,130,0.1)] cursor-pointer font-medium text-text-secondary hover:bg-[rgba(0,220,130,0.1)] hover:text-primary transition-all">
                        <input type="radio" name="collection-type" value="existing" className="accent-primary" />
                        Add to Existing Collection
                    </label>
                </div>

                {/* New Collection Section */}
                <div className="form-group bg-[rgba(22,23,27,0.5)] p-6 rounded-xl border border-border mb-6 transition-all hover:border-primary hover:bg-[rgba(22,23,27,0.7)]">
                    <h2 className="relative text-[2rem] font-bold bg-accent-gradient bg-clip-text text-transparent mt-8 mb-6 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        New Collection Metadata
                        <span className="block absolute left-0 bottom-[-8px] w-[60px] h-[3px] bg-accent-gradient rounded" aria-hidden="true"></span>
                    </h2>
                    {[
                        { id: "collection-id", label: "ID of the collection :", placeholder: "Collection ID" },
                        { id: "collection-name", label: "Name of the collection :", placeholder: "Collection Name" },
                        { id: "collection-category", label: "Category of the collection :", placeholder: "Category" },
                        { id: "collection-description", label: "Description of the collection :", placeholder: "Collection Description" },
                        { id: "collection-chain", label: "blockchain of the collection :", placeholder: "Blockchain" },
                        { id: "cover-imageUrl", label: "ImageUrl of the collection's cover image :", placeholder: "url of cover image" }
                    ].map(({ id, label, placeholder }) => (
                        <div key={id} className="mb-6">
                            <label htmlFor={id} className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">{label}</label>
                            <input type="text" id={id} placeholder={placeholder}
                                className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" />
                        </div>
                    ))}
                </div>

                {/* Existing Collection Section */}
                <div className="form-group bg-[rgba(22,23,27,0.5)] p-6 rounded-xl border border-border mb-6 transition-all hover:border-primary hover:bg-[rgba(22,23,27,0.7)] hidden">
                    <h2 className="relative text-[2rem] font-bold bg-accent-gradient bg-clip-text text-transparent mt-8 mb-6 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Existing Collection Info
                        <span className="block absolute left-0 bottom-[-8px] w-[60px] h-[3px] bg-accent-gradient rounded" aria-hidden="true"></span>
                    </h2>
                    <div className="mb-6">
                        <label htmlFor="existingCollection-id" className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">ID of the collection :</label>
                        <input type="text" id="existingCollection-id" placeholder="Collection ID"
                            className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="existingCollection-category" className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">Category of the collection :</label>
                        <input type="text" id="existingCollection-category" placeholder="Category"
                            className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" />
                    </div>
                </div>

                {/* NFT Uploading Section */}
                <div className="form-group bg-[rgba(22,23,27,0.5)] p-6 rounded-xl border border-border mb-6 transition-all hover:border-primary hover:bg-[rgba(22,23,27,0.7)]">
                    <h2 className="relative text-[2rem] font-bold bg-accent-gradient bg-clip-text text-transparent mt-8 mb-6 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Upload NFT
                        <span className="block absolute left-0 bottom-[-8px] w-[60px] h-[3px] bg-accent-gradient rounded" aria-hidden="true"></span>
                    </h2>
                    {[
                        { id: "nft-id", label: "NFT ID:", placeholder: "NFT ID" },
                        { id: "nft-name", label: "Name :", placeholder: "NFT Name" },
                        { id: "nft-category", label: "Category of the NFT :", placeholder: "Category" },
                        { id: "nft-description", label: "Description :", placeholder: "NFT Description" },
                        { id: "nft-price", label: "Price :", placeholder: "Price (ETH)" },
                        { id: "nft-image", label: "ImageUrl :", placeholder: "imageUrl" }
                    ].map(({ id, label, placeholder }) => (
                        <div key={id} className="mb-6">
                            <label htmlFor={id} className="block text-[1.1rem] text-text-secondary mt-4 mb-2 font-semibold tracking-wide">{label}</label>
                            <input type="text" id={id} placeholder={placeholder}
                                className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary transition-all backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] placeholder:text-text-muted placeholder:font-normal" />
                        </div>
                    ))}
                    <button
                        id="upload-button"
                        className="bg-accent-gradient text-background border-none py-4 px-8 rounded-xl text-[1.1rem] font-bold cursor-pointer block mx-auto mt-8 text-center transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow"
                    >
                        Upload NFT
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default UploadNFT;