const express             = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");

const ezvape      = require("./scripts/ezvape")
const surreyvapes = require("./scripts/surreyvapes")
const thunderbirdvapes = require("./scripts/thunderbirdvapes")




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


async function wooCommerceTest(){

  //thunderbirdvapes.execute()
  //surreyvapes.execute()
  ezvape.execute()

  }

wooCommerceTest()

 





/*

const html = fs.readFileSync('test.html', {encoding:'utf8', flag:'r'})
function f1(html){

  function scrapeSubcategories(category, link, slice_index, element){
    
    const appended_category = category + $(element).find("a").filter( (index) => index === 0 ).text() + "/"
    const appended_link = link + $(element).find(">a").attr("href").split("/").slice(slice_index).join("/") 
    categories.push({category: appended_category,link: appended_link})

    $(element).find("> .children").children().each( (idx, _el) => scrapeSubcategories(appended_category, appended_link, slice_index+1, _el))           
  }

  const $ = cheerio.load(html);
  const categories = []

  $(".product-categories").children().each( (idx,el) => scrapeSubcategories("", "/", 4, el))

  console.log(categories)
}




  function f2(html){

  const $ = cheerio.load(html);

  const categories = []

  $(".product-categories").children().each( (idx,el) => {

    const category = $(el).find("a").filter( (index) => index === 0 ).text()
    const link = $(el).find("a").attr("href").split("/")[4]
    const subcategories = []

    function scrapeSubcategories(category, link, slice_index, element){
      $(element).find("> .children").children().each( (idx, _el) => { 
          const appended_category = category + "/" + $(_el).find("a").filter( (index) => index === 0 ).text() 
          const appended_link = link+ "/" + $(_el).find(">a").attr("href").split("/").slice(slice_index).join("/")
          subcategories.push({category: appended_category,link: appended_link})
          scrapeSubcategories(appended_category, appended_link, ++slice_index, _el)
      })   
    }

    scrapeSubcategories(category, link, 4, el)

    categories.push({
      category: category,
      link: link,
      subcategories: subcategories
    })         
  })

  let x = 0

  categories.forEach( (a)=>{
    x = x + a.subcategories.length
  })

  console.log( x + categories.length)

}

f1(html)

*/



 





    

 

  

