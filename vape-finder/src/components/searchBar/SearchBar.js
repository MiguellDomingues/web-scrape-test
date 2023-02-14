import './search_bar.css'

import {useState, useEffect} from 'react'

const categories = ['Juices','Coils','Pods','Tanks','Starter Kits','Mods','Batteries','Chargers','Replacement Glass','Accessories/Miscellaneous',]
    
const _brands = [
    'ALLO', 'GORE', 'JUUL', 'VOOPOO'
]

const _stores = [
    'EZVAPE','SURREY VAPES', 'THUNDERBIRD VAPES'
]


function SearchBar( {refetch} ){

    //console.log(refetch)

  //const  { refetch } = refetch

   const [category, setCategory] = useState("");
   const [stores, setStores] = useState([]);
   const [brands, setBrands] = useState([]);

   const echo = () => console.log(category, stores, brands)

   echo()

   const selectedFilter = (str, arr) => arr.includes(str) ? " filter_selected" : "" 

   const onCategorySelected = (_category) => {
     const __category = _category === category ? "" : _category
     setCategory(__category)  
     refetch(__category, brands, stores) 
   }
 
   const onStoreSelected = (store) => { 
    const _stores = stores.includes(store) ? stores.filter( str => str !== store) : [...stores, store]
    setStores( _stores ) 
    refetch(category, brands, _stores) 
   }
 
   const onBrandSelected = (brand) => { 
     const _brands = brands.includes(brand) ? brands.filter( str => str !== brand) : [...brands, brand]
     setBrands( _brands )
     
     refetch(category, _brands, stores)
   }

return (<>

        <div className="search_bar_categories">
            {categories.map( (_category, idx) =>
                <span className={"search_bar_category cursor_hand" + selectedFilter(category, [_category])} 
                      key={idx} 
                      onClick={ () => onCategorySelected(_category) }>
                    {_category}  
                </span>)}
        </div>

        <div className="search_bar_shops_about">
            <div className="brands cursor_hand">
                Brands
                <div className="dropdown-arrow"></div>
                <div className="dropdown-content">    
                    {_brands.map( (brand, idx)=>
                        <span className={selectedFilter(brand, brands)} //selectedFilter(brand, brands)
                              key={idx} 
                              onClick={ ()=> onBrandSelected(brand) }>
                             {brand}
                        </span>)}                  
                </div>
            </div>
            <div className="shops cursor_hand">
                Shops
                <div className="dropdown-arrow"></div>
                <div className="dropdown-content">    
                    {_stores.map( (shop, idx)=>
                    <span className={selectedFilter(shop, stores)}  
                          key={idx} 
                          onClick={ () => onStoreSelected(shop) }>
                         {shop}
                    </span>)}                  
                </div>
            </div>        
           
           <span className="about cursor_hand">About</span> 
        </div>
    </>)

}

export default SearchBar