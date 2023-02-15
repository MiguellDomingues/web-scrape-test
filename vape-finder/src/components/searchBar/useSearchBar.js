import {useState} from 'react'
import { useQuery } from '@apollo/client' 
import { GET_SEARCH_TYPES } from '../../queries/queries.js'

export const useSearchBar = ( refetch ) =>{

    const [category, setCategory] = useState("");
    const [stores, setStores] = useState([]);
    const [brands, setBrands] = useState([]);

    const query = useQuery(GET_SEARCH_TYPES);

    const { data, loading, error } = query

    console.log("////", data, loading, error)

    const orderTagsByProductCount = (tags) => tags.sort( (lhs, rhs)=> rhs.product_count-lhs.product_count)
    const filterTagsByMinProductCount = (tags, min_product_count = 0) => tags.filter((tag) => tag.product_count >= min_product_count)
    
    const filter_tags = {
        category_tags : !loading ? orderTagsByProductCount( filterTagsByMinProductCount (data["getSearchTypes"][0].tags)) : [],
        brands_tags : !loading ? orderTagsByProductCount( filterTagsByMinProductCount (data["getSearchTypes"][1].tags, 5)) : [],
        stores_tags : !loading ? orderTagsByProductCount( filterTagsByMinProductCount (data["getSearchTypes"][2].tags)) : []
    }

    const selected_filters = { category, stores, brands }

    const echo = () => console.log(category, stores, brands)

    echo()
    
    const selectedFilterBGC = (str, arr) => arr.includes(str) ? " filter_selected" : "" 

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

    return [
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
    ]
}