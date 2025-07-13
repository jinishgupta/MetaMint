import Header from '../components/Header';
import Footer from '../components/Footer';

function SearchAndSort() { 
  return (
    <div>
      <Header />
      <div className="flex min-h-[80vh] w-full max-w-[1400px] mx-4">
        {/* Left Sidebar Filter Controls */}
        <div className=" w-full max-w-xs p-4 my-4 ml-0">
          {/* Shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-gradient origin-left scale-x-0 hover:scale-x-100 transition-transform duration-300" />
          <div className="filter-row flex flex-col gap-6 mb-6">
            <div className="filter-group flex flex-col min-w-[200px] flex-1">
              <label htmlFor="sort-criteria" className="text-[1.2rem] text-text-secondary font-semibold mb-2 block tracking-wide">Sort by:</label>
              <select id="sort-criteria" className="bg-surface-light text-text-primary text-base my-2 p-3 border-2 border-border rounded-lg transition-all cursor-pointer backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] hover:border-primary hover:bg-surface-lighter">
                <option value="none">None</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
            <div className="filter-group flex flex-col min-w-[200px] flex-1">
              <label htmlFor="sort-order" className="text-[1.2rem] text-text-secondary font-semibold mb-2 block tracking-wide">Order:</label>
              <select id="sort-order" className="bg-surface-light text-text-primary text-base my-2 p-3 border-2 border-border rounded-lg transition-all cursor-pointer backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] hover:border-primary hover:bg-surface-lighter">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="filter-group flex flex-col min-w-[200px] flex-1">
              <label htmlFor="category-filter" className="text-[1.2rem] text-text-secondary font-semibold mb-2 block tracking-wide">Category:</label>
              <select id="category-filter" className="bg-surface-light text-text-primary text-base my-2 p-3 border-2 border-border rounded-lg transition-all cursor-pointer backdrop-blur font-medium focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(0,220,130,0.15)] focus:scale-[1.02] hover:border-primary hover:bg-surface-lighter">
                <option value="All">All</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Gaming">Gaming</option>
                <option value="PFP">PFPs</option>
                <option value="Photography">Photography</option>
              </select>
            </div>
            <button id="sort" className="bg-accent-gradient text-background text-base font-bold my-2 py-3 px-6 rounded-xl border-none cursor-pointer transition-all relative overflow-hidden uppercase tracking-wide shadow-md hover:bg-accent-gradient-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-glow">
              Sort
            </button>
          </div>
        </div>
        <div className="w-[2px] bg-white/20 min-h-[500px] mx-2 rounded-full self-stretch" />
        <div className='flex-3 mx-10 p-4 my-4'>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SearchAndSort;