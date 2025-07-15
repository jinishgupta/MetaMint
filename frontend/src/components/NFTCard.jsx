import { useNavigate } from 'react-router-dom';

function NFTCard({ imageUrl, name, owner, price, description, id, ...rest }) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/nft', { state: { imageUrl, name, owner, price, description, id, ...rest } });
    };
    return (
        <div
        className="w-[300px] h-[430px] flex flex-col items-center rounded-2xl border-2 border-[rgba(0,255,130,0.2)] bg-[rgba(22,23,27,0.8)] shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-[0_0_16px_2px_rgba(0,255,130,0.5)] hover:-translate-y-2 group cursor-pointer"
        onClick={handleClick}
      >
        <div className="w-full h-[320px] flex items-center justify-center overflow-hidden rounded-t-2xl p-2">
          <img
            src={`https://${imageUrl}`}
            alt="Collection"
            className="w-full h-[300px] object-cover rounded-t-2xl"
          />
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-2">
        <div className="text-lg font-semibold mb-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">{name}</div>
        <div className="text-white text-sm">Price:</div>
        <div className="text-base font-bold mb-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">{price} ETH</div>
        <div className="text-white text-sm">Owner:</div>
        <div className="text-base font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">{owner}</div>
        </div>
      </div>
      )
}

export default NFTCard;