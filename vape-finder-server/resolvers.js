const { Product, SearchType } = require('./classes.js')
const { fetchSampleProducts, fetchProductsByCategoryBrandStore, fetchTagMetaData } = require('../database/read/readProducts.js')

function buildQuery(last_product_id, category, stores, brands){

    const query_str = {}
  
    if(last_product_id)     query_str["_id"] = { "$gt" : last_product_id }
    if(category.length > 0) query_str["categories"] = { "$in" : category }
    if(stores.length > 0)   query_str["source"] = { "$in" : stores}
    if(brands.length > 0)   query_str["product_info.brand"] = { "$in" : brands }
  
    console.log("/// query string: ", query_str)
  
    return query_str
  }
  
  var root = {

      getProducts: async ( {last_product_id, category, stores, brands} ) => {
  
        console.log("///// query: getProducts ", "l_id:", last_product_id, "c:", category, "s:", stores, "b:", brands)
  
        if(category.length === 0 && stores.length === 0 && brands.length === 0) 
          return (await fetchSampleProducts()).map( product => new Product(product))
          
        let result = (await fetchProductsByCategoryBrandStore( buildQuery(last_product_id,category, stores, brands)) )//.map( product => new Product(product))
       
        result = result.map( product => new Product(product))
        last_product_id && console.log("from ", last_product_id)
        console.log(result.length)
        return result
      },
      getSearchTypes: async ({}) => {
        console.log("///// query: getSearchTypes")
        return (await fetchTagMetaData() ).map( tmd => new SearchType(tmd))
      },
      //getInit: () => {
      //  return new Init()
     // },
  };

module.exports = { root } 