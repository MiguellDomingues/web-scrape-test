const express             = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");

const ezvape      = require("./scripts/ezvape")
const surreyvapes = require("./scripts/surreyvapes")
const thunderbirdvapes = require("./scripts/thunderbirdvapes")
const westsidesmokes = require("./scripts/westsidesmokes")



//const shopify = require("./shopify")



var app                   = express();
PORT = 8080


/*
app.listen(PORT, () => {
    console.log("server running")
});

app.get( '/', (req, res) => {
    
    res.send('success')
})
*/




  /*

async function b(){

    const { data } = await axios.get('https://www.thunderbirdvapes.com/collections/all-e-liquids?page=2');

    json_str = data.match(/var meta = (\{.*\})/)[1]
  let data1 = JSON.parse(json_str)

    //console.log(data)

    let variant_count = 0
    let product_count = 0

    data1["products"].forEach( (product) => {
         
        product.variants && product.variants.forEach( (variant) => { 
            variant_count++
            //console.log("variant: ", variant)
        } ) 

        product_count++
        
    })

    console.log("pc:", product_count)
    console.log("vc:", variant_count)

  }
  
 */

/*
  async function test(){

    //const { data } = await axios.get('https://www.thunderbirdvapes.com/collections/pods');

    //var $ = cheerio.load(data);
    //json = data.match(/var meta = (\{.*\})/)[1]
    //console.log(JSON.parse(json) )

    fs.readFile('./pages/www_thunderbirdvapes_com.html', 'utf8', function(err, data) {
  
        if (err) throw err;

        //console.log("success")
    
        //var $ = cheerio.load(data);
       // console.log($.html());
  
       // json = data.match(/var meta = (\{.*\})/)[0]
        //console.log(json)
  //
        json_str = data.match(/var meta = (\{.*\})/)[1]
        json_obj = JSON.parse(json_str)


        //console.log(json_obj) 

        json_obj["products"].forEach( (product) => {
            product.id && console.log("id: ", product.id) 
            product.gid && console.log("gid: ", product.gid) 
            product.vendor && console.log("vendor: ", product.vendor) 
            product.type && console.log("type: ", product.type) 
            product.variants && product.variants.forEach( (variant) => console.log("variant: ", variant) ) 
        }) 
    });
  }
  */


  async function shopifyTest (){

    //collections = await shopify.fetchCollections('www.thunderbirdvapes.com')

    //console.log(collections.length)

    //shopify.writeCollection('www.thunderbirdvapes.com', collections)

    const handles = shopify.readCollectionHandles('www.thunderbirdvapes.com')

    /*
   
    for (const handle of handles) {
        const products = await shopify.fetchProductsByHandle('www.thunderbirdvapes.com' , handle)
        console.log(handle, products.length)
        products.length > 0 && shopify.writeProductsByHandle('www.thunderbirdvapes.com' ,handle, products)
        await (() => new Promise(resolve => setTimeout(resolve, 2500)))();
    }

    */

    let count = 0

    const parsed_products = shopify.readProducts('www.thunderbirdvapes.com').map( (product)=>{
        product.variants && product.variants.length > 0 && count++
        return shopify.parseProduct(product)
    })

    console.log(parsed_products.length, " ",count)

  }

  //shopifyTest()



async function wooCommerceTest(){

    /*

    thunderbirdvapes.scrapeProductPages().then( ()=>{
        thunderbirdvapes.writeInventory()
    })

  surreyvapes.scrapeProductPages().then( ()=>{
    surreyvapes.writeInventory()
    })

    */

  

    ezvape.scrapeProductsBrandsCategories().then( 
        ()=> ezvape.scrapeProductBrands().then( 
        ()=> ezvape.scrapeProductCategories().then( 
        ()=> ezvape.writeInventory() 
    )))
    
     
     

    //scrapeProductsBrandsCategories, scrapeProductBrands, scrapeProductCategories, mergeProductBrandsCategories
    

    //https://www.thunderbirdvapes.com/products.json?limit=1000

   // const { data } = await axios.get('https://www.thunderbirdvapes.com/products.json?limit=250&page=5')

  //  console.log(data["products"].length)

   

    

    //surreyvapes.scrapeProductPages()

    //surreyvapes.writeInventory()

    //ezvape.mergeProductBrandsCategories()

    //ezvape.scrapeProductCategories()

    //ezvape.scrapeProductBrands()

    //ezvape.scrapeProductsBrandsCategories()

  }

  wooCommerceTest()

  

