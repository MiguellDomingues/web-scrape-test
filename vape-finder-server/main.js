var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var { fetchProducts, fetchProductsByCategoryBrandStore, fetchTagMetaData } = require('../database/read/readProducts.js')

var app = express();
var cors = require('cors');
app.use( cors() );          // allow react app communicate with server on same machine/diff port

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`

  type Init {
    getSearchTypes : [SearchType!]
    getInitProducts: [Product!]
  }

  type SearchType {
    type_name: String!
    tags:      [Tag!] 
  }

  type Tag {
    tag_name:      String!
    product_count: Int!
  }

  type Product {
    id:           ID!
    source_id:    String!                
    source_url:   String!
    last_updated: String! 
    info:         ProductInfo!
  }

  type ProductInfo {
    name:             String!                 
    img_src:          String
    info_url:         String!               
    price:            Float!             
    brand:            String             
    category_str:     String   
  }

  type Query {
    
    getProducts(category: String!, stores: [String!], brands: [String!]): [Product!]
    getInit: Init
    getSearchTypes: [SearchType!]
  }
`);

class Init {
  async getSearchTypes(){
    console.log("gst")

    try{
      return (await fetchTagMetaData() ).map( tmd => new SearchType(tmd))
    }catch(err){
      console.log(err)
    }
    
  }
  async getInitProducts(){
    console.log("init pro")

    try{
      return  (await fetchProducts()).map( product => new Product(product))
    }catch(err){
      console.log(err)
    }

    
  }
}

class Tag {
  constructor( {tag_name , product_count} ) {
    this.tag_name = tag_name         
    this.product_count = product_count                  
  }
}

class SearchType {
  constructor( {type_name, tags} ) {
        this.type_name = type_name          
        this.tags = tags.map ( t => new Tag(t) )
  }
}
 
class Product {
  constructor({_id, source_id, source_url, last_updated, product_info} ) {

        this.id = _id         
        this.source_id = source_id                   
        this.source_url = source_url   
        this.last_updated = last_updated 
        this.info = new ProductInfo(product_info) 
  }
}

class ProductInfo {
    constructor({name, img_src, price, brand, category_str,info_url}) {
        this.name = name
        this.img_src = img_src
        this.price = price
        this.brand = brand
        this.category_str = category_str
        this.info_url = info_url
  }
}

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

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});
