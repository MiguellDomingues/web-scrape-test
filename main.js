const express             = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");
const url = require('url');   

const ezvape      = require("./scripts/ezvape")
const surreyvapes = require("./scripts/surreyvapes")
const thunderbirdvapes = require("./scripts/thunderbirdvapes")

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

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }



async function wooCommerceTest(){
//
 // console.log( isValidUrl('ww/fdegrtgrfdg//,com') )

  //thunderbirdvapes.execute()
  //surreyvapes.execute()
   ezvape.execute()

  }
wooCommerceTest()

 




 





    

 

  

