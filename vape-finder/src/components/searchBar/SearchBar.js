import './search_bar.css'


const categories = [
    'Disposables','E-Juice','Hardware','Pods','Vape Kits','Accessories'
]

const brands = [
    'ALLO', 'GORE', 'JUUL', 'VOOPOO'
]

const shops = [
    'EZVAPE','SURREY VAPES', 'THUNDERBIRD VAPES'
]


function SearchBar( {handleTagSelected} ){

   //const { categorySelected , shopSelected, brandSelected} = selected

//const categorySelected = (category) => { console.log(category) }
//const brandSelected = (brand) => { console.log(brand) }
//const shopSelected = (shop) => { console.log(shop) }

return (<>

        <div className="search_bar_categories">
            {categories.map( (category, idx) =>
                <span className="search_bar_category cursor_hand" 
                      key={idx} 
                      onClick={ () => handleTagSelected(category) }>
                    {category}  
                </span>)}
        </div>

        <div className="search_bar_shops_about">
            <div className="brands cursor_hand">
                Brands
                <div className="dropdown-arrow"></div>
                <div className="dropdown-content">    
                    {brands.map( (brand, idx)=>
                    <span key={idx} onClick={()=>handleTagSelected(brand)}>
                        {brand}
                    </span>)}                  
                </div>
            </div>
            <div className="shops cursor_hand">
                Shops
                <div className="dropdown-arrow"></div>
                <div className="dropdown-content">    
                    {shops.map( (shop, idx)=>
                    <span key={idx} onClick={()=>handleTagSelected(shop)}>
                        {shop}
                    </span>)}                  
                </div>
            </div>        
           
           <span className="about cursor_hand">About</span> 
        </div>
    </>)

}

export default SearchBar