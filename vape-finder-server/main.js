var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var { fetchProducts, fetchProductsByBucket } = require('../database/read/readProducts.js')

var app = express();
var cors = require('cors');
app.use( cors() );          // allow react app communicate with server on same machine/diff port

// Construct a schema, using GraphQL schema language

var schema = buildSchema(`

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
  }
`);

     

// If Message had any complex fields, we'd put them on this object.
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

var root = {
    getProducts: async ( {category, stores, brands} ) => {

      console.log(category, stores, brands)

      /*
      if(tags.length === 0){
        console.log("no tags")
        return (await fetchProducts()).map( product => new Product(product))
      }else{
        console.log("tags: ", tags)
        return (await fetchProductsByBucket(tags)).map( product => new Product(product))
      }
      */
        return (await fetchProducts()).map( product => new Product(product))
      

      //return (await fetchProducts()).map( product => new Product(product))

      
    },
};


app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});




/*
//working client query
var query = `query GetProducts {
    getProducts{
        id, source_id, 
    info{
      brand, category
        }   
    }   
  }                       
`;

fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    
  })
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));

*/