import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronUp} from '@fortawesome/free-solid-svg-icons';
import NFTCard from '../components/NFTCard';
import CollectionCard from '../components/CollectionCard';
import HeroElement from '../components/HeroElement';
import flowers from '../assets/sample.jpg';
import sample2 from '../assets/sample2.jpg';
import sample3 from '../assets/sample3.jpg';
import { useRef } from 'react';

function ScrollingLayout({heading}) {
    const scrollRef = useRef(null);

    const scrollByAmount = (amount) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    return (
        <div>
            <div>
                <h2 className='relative text-[2.5rem] font-extrabold mt-12 mx-8 mb-8 text-center bg-gradient-to-r from-green-400 to-blue-800 bg-clip-text text-transparent'>
                    {heading || 'Explore Our Collection'}
                    <span className="block absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-20 h-1 bg-gradient-to-r from-green-400 to-blue-800 rounded"></span>
                </h2>
            </div>
        <div className='relative w-screen flex items-center justify-center'>
            {/* Left Scroll Icon */}
            <button
                className='absolute left-0 z-10 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 rounded-full p-2 flex items-center justify-center transition-colors'
                onClick={() => scrollByAmount(-350)}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                aria-label='Scroll Left'
            >
                <FontAwesomeIcon icon={faChevronUp} rotation={270} size='2x' className='text-white' />
            </button>
            {/* Scrollable Cards */}
            <div
                ref={scrollRef}
                className='overflow-x-auto scrollbar-hide flex-1 min-w-0 p-4 mx-6 whitespace-nowrap flex gap-4 snap-x snap-mandatory'
            >
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
                <div className='inline-flex snap-start'><HeroElement /></div>
            </div>
            {/* Right Scroll Icon */}
            <button
                className='absolute right-0 z-10 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 rounded-full p-2 flex items-center justify-center transition-colors'
                onClick={() => scrollByAmount(350)}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                aria-label='Scroll Right'
            >
                <FontAwesomeIcon icon={faChevronUp} rotation={90} size='2x' className='text-white' />
            </button>
        </div>
        </div>
    )
}

export default ScrollingLayout;