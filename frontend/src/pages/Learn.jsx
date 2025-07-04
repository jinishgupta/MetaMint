import Header from '../components/Header';
import Footer from '../components/Footer';

const videos = [
  {
    src: 'https://www.youtube.com/embed/NNQLJcJEzv0',
    title: 'What is an NFT',
  },
  {
    src: 'https://www.youtube.com/embed/SQyg9pyJ1Ac',
    title: 'What is a crypto wallet',
  },
  {
    src: 'https://www.youtube.com/embed/1YyAzVmP9xQ',
    title: 'What is cryptocurrency',
  },
  {
    src: 'https://www.youtube.com/embed/KTZDEwF55ts',
    title: 'What are gas fees in crypto',
  },
  {
    src: 'https://www.youtube.com/embed/yubzJw0uiE4',
    title: 'What is a blockchain',
  },
  {
    src: 'https://www.youtube.com/embed/0tZFQs7qBfQ',
    title: 'What is web3',
  },
  {
    src: 'https://www.youtube.com/embed/bm2Khh0Hbjg',
    title: 'How to stay protected in web3',
  },
];

function Learn() {
  return (
    <div>
      <Header />
      <h1 className="relative text-center py-8 px-0 bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border-2 border-glass-border text-text-primary mb-8 font-black text-[3rem] rounded-2xl shadow-xl select-none z-[1] animate-fadeInUp bg-accent-gradient bg-clip-text text-transparent tracking-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
        Learn Section
        <span className="block absolute left-1/2 -translate-x-1/2 bottom-[10px] w-[100px] h-1 bg-accent-gradient rounded" aria-hidden="true"></span>
      </h1>
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8 max-w-[1400px] mx-auto relative z-[1]">
        {videos.map((video) => (
          <div
            key={video.src}
            className="video group relative border-2 border-glass-border bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] rounded-2xl overflow-hidden h-[280px] shadow-lg transition-all duration-300 cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl hover:shadow-glow hover:border-primary"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-gradient origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,220,130,0.05)] to-[rgba(108,92,231,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
            <iframe
              src={video.src}
              title={video.title}
              allowFullScreen
              className="w-full h-full border-none transition-transform duration-300 relative z-10 max-w-full max-h-full object-cover group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Learn;