import './search_bar.css'

const categories = [
    'Disposables','E-Juice','Hardware','Pods','Vape Kits','Accessories'
]

function SearchBar(){

return (
    <>

        <div className="search_bar_categories">
            {categories.map( (category, idx) =>
                <span className="search_bar_category" key={idx}>{category}  </span>
            )}

        </div>

        <div className="search_bar_shops_about">
           <span className="shops">Shops</span> 
           
           <span classname="about">About</span> 
        </div>

        

    </>)
}

export default SearchBar