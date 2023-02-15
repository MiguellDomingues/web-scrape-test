const { Product, SearchType } = require('./classes.js')
const { fetchProducts, fetchProductsByCategoryBrandStore, fetchTagMetaData } = require('../database/read/readProducts.js')

function buildQuery(category, stores, brands){

    const query_str = {}
  
    if(category.length > 0) query_str["categories"] = { "$in" : category }
    if(stores.length > 0)   query_str["source"] = { "$in" : stores}
    if(brands.length > 0)   query_str["product_info.brand"] = { "$in" : brands }
  
    console.log("/// query string: ", query_str)
  
    return query_str
  }
  
  var root = {

      getProducts: async ( {category, stores, brands} ) => {
  
        console.log("///// query: getProducts ", category, stores, brands)
  
        if(category.length === 0 && stores.length === 0 && brands.length === 0) 
          return (await fetchProducts()).map( product => new Product(product))
          
        let result = (await fetchProductsByCategoryBrandStore( buildQuery(category, stores, brands)) ).map( product => new Product(product))
        //console.log(result.length)
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