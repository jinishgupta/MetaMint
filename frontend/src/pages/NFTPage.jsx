import Footer from "../components/Footer";
import Header from "../components/Header";
import sample2 from "../assets/sample2.jpg";

function NFT() {
    return (
        <div>
            <Header />
            <div className="flex w-full max-w-[1400px] mx-auto mt-8 px-4 gap-8">
                {/* Left: NFT Info */}
                <div className="flex-1 max-w-xl h-[900px] bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-10 relative animate-fadeInUp">
                    <h1 className="text-[3.2rem] font-black bg-accent-gradient bg-clip-text text-transparent mb-2 tracking-tight select-none" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                        Majestic Vivid
                    </h1>
                    <div className="h-[4px] w-[100px] bg-accent-gradient rounded mb-8" />
                    <h2 className="text-3xl font-bold text-text-primary mb-4 mt-8">About the NFT:</h2>
                    <div className="h-[3px] w-[60px] bg-accent-gradient rounded mb-6" />
                    <p className="text-xl font-semibold text-primary mb-8">A beautiful NFT artwork description goes here. This can be dynamic.</p>
                    <h3 className="text-2xl font-bold text-text-primary mb-6 mt-10">Details</h3>
                    <div className="bg-[rgba(22,23,27,0.5)] rounded-xl p-8 mb-8">
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Id:</span>
                            <span className="text-primary">tfcgg</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Owner:</span>
                            <span className="text-primary">Jinish Gupta</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Category:</span>
                            <span className="text-primary">Art</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Views:</span>
                            <span className="text-primary">55</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border last:border-b-0 text-lg">
                            <span className="text-text-secondary">Favorites:</span>
                            <span className="text-primary">3</span>
                        </div>
                        <div className="flex justify-between py-3 text-lg">
                            <span className="text-text-secondary">Price:</span>
                            <span className="text-primary">0.001 ETH</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center mt-8">
                        <div className="flex items-center">
                            <i className="fa-regular fa-heart text-2xl text-primary" />
                            <i className="fa-solid fa-heart text-2xl text-primary hidden" />
                        </div>
                        <button className="bg-accent-gradient text-background text-lg font-bold py-3 px-8 rounded-xl shadow-md hover:bg-accent-gradient-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-glow transition-all uppercase tracking-wide justify-self-center">Buy Now</button>
                        <div></div>
                    </div>
                </div>
                {/* Vertical Divider */}
                <div className="w-[2px] bg-white/20 min-h-[500px] mx-4 rounded-full self-stretch" />
                {/* Right: NFT Image */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border rounded-2xl shadow-xl p-6 flex items-center justify-center max-w-xl w-full h-[850px]">
                        <img src={sample2} alt="NFT" className="rounded-2xl w-full h-full object-cover" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default NFT;