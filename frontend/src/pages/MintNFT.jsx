import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function MintNFT() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append('user', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'); // Example address, replace with actual user
            formData.append('name', name);
            formData.append('description', description);
            formData.append('file', file);
            const res = await fetch('http://localhost:4000/mint', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Minting failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (    
        <div>
            <Header />
            <div className="relative z-[1] mx-auto my-12 max-w-[500px] rounded-2xl shadow-xl bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border p-12 animate-fadeInUp">
                <h1 className="text-center text-[2.5rem] font-black bg-accent-gradient bg-clip-text text-transparent mb-8 tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Mint Your NFT
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-lg font-semibold mb-2 text-text-secondary">NFT Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="NFT Name" />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold mb-2 text-text-secondary">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-4 border-2 border-border rounded-lg bg-surface-light text-base text-text-primary font-medium focus:outline-none focus:border-primary" placeholder="NFT Description" />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold mb-2 text-text-secondary">Image</label>
                        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required className="w-full p-2" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-accent-gradient text-background border-none py-4 px-8 rounded-xl text-[1.1rem] font-bold cursor-pointer block mx-auto mt-4 text-center transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow disabled:opacity-60">
                        {loading ? 'Minting...' : 'Mint NFT'}
                    </button>
                </form>
                {result && (
                    <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl text-green-200 text-center">
                        <div className="font-bold">NFT Minted!</div>
                        <div>Token ID: {result.tokenId}</div>
                        <a href={result.metaUrl} target="_blank" rel="noopener noreferrer" className="underline text-green-300">View Metadata on IPFS</a>
                    </div>
                )}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-200 text-center">
                        {error}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default MintNFT;