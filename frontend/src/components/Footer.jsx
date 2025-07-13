import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import mintbitLogo from '../assets/mintbit-brands.svg';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 py-16 px-8 mt-20 bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-t-2 border-[var(--glass-border)] relative z-10 group">
            {/* Gradient border effect on hover */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent-gradient)] scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            
            <div className="px-4">
                <div className="relative">
                  <h3
                    className="mb-6 text-[1.4rem] font-bold bg-gradient-to-r from-green-400 to-blue-800 bg-clip-text text-transparent tracking-tight relative"
                  >
                    Marketplace
                    <span
                      className="block absolute left-0 bg-gradient-to-r from-green-400 to-blue-800"
                      style={{
                        bottom: '-8px',
                        width: '40px',
                        height: '3px',
                        borderRadius: '2px',
                        position: 'absolute',
                        content: "''"
                      }}
                    />
                  </h3>
                </div>
                <ul className="list-none p-0 m-0">
                    <li className="mb-3"><strong>Categories:</strong></li>
                    <li className="mb-3 text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2" onClick={() => navigate('/#art')}>Art</li><br />
                    <li className="mb-3 text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2" onClick={() => navigate('/#gaming')}>Gaming</li><br />
                    <li className="mb-3 text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2" onClick={() => navigate('/#pfp')}>PFPs</li><br />
                    <li className="mb-3 text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2" onClick={() => navigate('/#photography')}>Photography</li><br />
                </ul>
            </div>

            <div className="px-4">
                <div className="relative">
                  <h3
                    className="mb-6 text-[1.4rem] font-bold bg-gradient-to-r from-green-400 to-blue-800 bg-clip-text text-transparent tracking-tight relative"
                  >
                    Learn
                    <span
                      className="block absolute left-0 bg-gradient-to-r from-green-400 to-blue-800"
                      style={{
                        bottom: '-8px',
                        width: '40px',
                        height: '3px',
                        borderRadius: '2px',
                        position: 'absolute',
                        content: "''"
                      }}
                    />
                  </h3>
                </div>
                <ul className="list-none p-0 m-0">
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=NNQLJcJEzv0" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">What is an NFT?</a>
                    </li>
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=SQyg9pyJ1Ac" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">What is a crypto wallet?</a>
                    </li>
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=1YyAzVmP9xQ" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">What is cryptocurrency?</a>
                    </li>
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=KTZDEwF55ts" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">What are gas fees in crypto?</a>
                    </li>
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=yubzJw0uiE4" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">What is a blockchain?</a>
                    </li>
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=0tZFQs7qBfQ" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">What is web3?</a>
                    </li>
                    <li className="mb-3">
                        <a href="https://www.youtube.com/watch?v=bm2Khh0Hbjg" target="_blank" rel="noopener" className="text-[var(--text-secondary)] no-underline text-[0.95rem] font-medium transition-all duration-300 py-1 inline-block hover:text-[var(--primary)] hover:translate-x-2">How to stay protected in web3?</a>
                    </li>
                </ul>
            </div>

            <div className="px-4">
                <div className="flex items-center gap-3 mb-6 relative">
                <img 
                        src={mintbitLogo} 
                        alt="Mintbit Logo" 
                        className="w-7 h-7 select-none transition-all duration-300 hover:scale-110 hover:rotate-6" 
                        style={{
                            filter: 'drop-shadow(0 0 10px #00ffa3) drop-shadow(0 0 20px #1e3a8a)',
                            transform: 'scaleX(-1)'
                        }}
                    />
                  <h3
                    className="m-0 text-[1.4rem] font-bold bg-gradient-to-r from-green-400 to-blue-800 bg-clip-text text-transparent tracking-tight relative"
                  >
                    MetaMint
                    <span
                      className="block absolute left-0 bg-gradient-to-r from-green-400 to-blue-800"
                      style={{
                        bottom: '-8px',
                        width: '40px',
                        height: '3px',
                        borderRadius: '2px',
                        position: 'absolute',
                        content: "''"
                      }}
                    />
                  </h3>
                </div>
                <p>Welcome to MetaMint, the ultimate destination for discovering, collecting, and trading unique digital
                    assets. Whether you're an artist, collector, or NFT enthusiast, we offer a seamless platform to explore
                    a diverse range of high-quality NFTs, from art and music to gaming assets and exclusive collectibles.
                    Dive into hand-curated collections, explore trending projects, and unlock the true potential of
                    blockchain-powered ownership.</p>
                <br />
                <p><strong>Need help?</strong></p>
                <p id="support">Contact support:</p>
                <p><FontAwesomeIcon icon={faPhone} aria-hidden="true"/> Mobile: 123-456-7890</p>
                <p><FontAwesomeIcon icon={faEnvelope} aria-hidden="true"/> Email: support@metamint.com</p>
            </div>
        </div>
    )
}

export default Footer;