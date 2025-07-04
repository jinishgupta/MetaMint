import Header from "../components/Header";

function Profile() {
  return (
    <><Header /><div
      className="flex flex-wrap justify-center gap-20 p-12 max-w-[1400px] mx-auto relative z-[1] min-h-screen "
    >
      <div className="flex-1 flex justify-center p-8 min-w-[400px]">
        <div
          className="card flex flex-col bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border border-gray-600 rounded-2xl w-[340px] h-[540px] shadow-xl overflow-hidden p-10 text-center justify-center mt-8 transition-all cursor-pointer relative"
        >
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 w-[180px] h-[150px] rounded-[100px/80px] mx-auto mb-8 flex justify-center items-center shadow-lg transition-all relative overflow-hidden"
          >
            <span className="text-black text-7xl font-extrabold select-none z-10">J</span>
          </div>
          <h4
            className="mb-0 font-black text-4xl leading-tight"
          >
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Jinish Gupta
            </span>
          </h4>
          <p className="text-base text-gray-300 font-medium mt-6">Joined December 2024</p>
          <p className="text-base text-gray-300 font-medium">No Wallet</p>
        </div>
      </div>
      <div className=" flex-[4] p-8 overflow-hidden min-w-[600px] flex items-center">
        <div className=" bg-[rgba(22,23,27,0.8)] backdrop-blur-[30px] border border-gray-600 rounded-2xl p-12 shadow-xl transition-all relative mx-auto w-full max-w-4xl">
          <h5 className="text-4xl text-center font-extrabold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent relative">
            NFTs
            <span className="block mx-auto mt-2 w-20 h-1 rounded bg-gradient-to-r from-green-400 to-blue-500"></span>
          </h5>
          <div className="text-center mt-8 flex justify-center gap-6">
            <button
              className="categories bg-gradient-to-r from-green-400 to-blue-500 text-lg rounded-full py-3 px-8 font-bold text-black shadow-md transition-all border-none uppercase tracking-wide"
              id="ownedNFTs"
            >
              Owned NFTs
            </button>
            <button
              className="categories bg-gradient-to-r from-green-400 to-blue-500 text-lg rounded-full py-3 px-8 font-bold text-black shadow-md transition-all border-none uppercase tracking-wide"
            >
              Favorites
            </button>
          </div>
          <div
            className="nft-grid grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-8"
          ></div>
          <div
            className="nft-grid grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-8"
          ></div>
        </div>
      </div>
    </div></>
  );
}

export default Profile;