import './search_bar.css'

import { useSearchBar } from './useSearchBar.js'

function SearchBar( {refetch} ){

    const [
       filter_tags,
       selected_filters,
        loading,
        error,
        {
            selectedFilterBGC,
            onCategorySelected,
            onStoreSelected,
            onBrandSelected 
        }
     ] = useSearchBar(refetch)

    const { category_tags, brands_tags, stores_tags } = filter_tags
    const { category, stores, brands, } = selected_filters

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

    return (<>

        <div className="search_bar_categories">
            {category_tags.map( (c, idx) =>
            <div>
                <span className={"search_bar_category cursor_hand" + selectedFilterBGC(category, [c.tag_name])} 
                      key={idx} 
                      onClick={ () => onCategorySelected(c.tag_name)}>
                    {c.tag_name}              
                </span>
                <span className="search_bar_product_count">{c.product_count}</span>
            </div>)}
        </div>

        <div className="search_bar_shops_about">

        <DropDownMenu title="Brands" tags={brands_tags} selected_tags={brands} selectedHandler={onBrandSelected} selectedTagsBGC={selectedFilterBGC}/>
        <DropDownMenu title="Stores" tags={stores_tags} selected_tags={stores} selectedHandler={onStoreSelected} selectedTagsBGC={selectedFilterBGC}/>
                {/*
        <div className="shops cursor_hand">
                Shops
                <div className="dropdown-arrow"></div>
                <div className="dropdown-content">    
                    {stores_tags.map( (store, idx)=>
                    <span className={selectedFilterBGC(store.tag_name, stores)}  
                          key={idx} 
                          onClick={ () => onStoreSelected(store.tag_name) }>
                         {store.tag_name} {store.product_count}
                    </span>)}                  
                </div>
        </div>   
        
                    */  }
           
           <span className="about cursor_hand">About</span> 
        </div>
    </>)
}

export default SearchBar

function DropDownMenu( {title, tags, selected_tags, selectedHandler, selectedTagsBGC} ){

    return(<div className="brands cursor_hand">
    {title}
    <div className="dropdown-arrow"></div>
    <div className="dropdown-content">    
        {tags.map( (tag, idx)=>
            <span className={selectedTagsBGC(tag.tag_name, selected_tags)}
                  key={idx} 
                  onClick={ ()=> selectedHandler(tag.tag_name)}>
                 {tag.tag_name} {tag.product_count}          
            </span>)}                  
    </div>
</div>)
}


 /*

   const [category, setCategory] = useState("");
   const [stores, setStores] = useState([]);
   const [brands, setBrands] = useState([]);

   const query = useQuery(GET_SEARCH_TYPES);

   const { data, loading, error } = query

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

   console.log("////", data, loading, error)

   const orderTagsByProductCount = (tags) => tags.sort( (lhs, rhs)=> rhs.product_count-lhs.product_count)
   const filterTagsByMinProductCount = (tags, min_product_count = 0) => tags.filter((tag) => tag.product_count >= min_product_count)
   const selectedFilterBGC = (str, arr) => arr.includes(str) ? " filter_selected" : "" 

   const category_tags = orderTagsByProductCount( filterTagsByMinProductCount (data["getSearchTypes"][0].tags))
   const brands_tags = orderTagsByProductCount( filterTagsByMinProductCount (data["getSearchTypes"][1].tags, 5))
   const stores_tags =  orderTagsByProductCount( filterTagsByMinProductCount (data["getSearchTypes"][2].tags))

   const echo = () => console.log(category, stores, brands)
   echo()

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
   */