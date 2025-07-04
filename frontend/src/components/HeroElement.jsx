import sample1 from '../assets/sample.jpg';
import sample2 from '../assets/sample2.jpg';

function HeroElement() {
    return(
        <div className="inline-flex items-center justify-center w-[450px] h-[400px]">
            <img src={sample1} className='w-full h-full rounded-xl bg-black p-1 object-cover'/>
        </div>
    );
}

export default HeroElement;