const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.surreyvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/surreyvapes`

const INVENTORY_FILE_NAME       = 'surreyvapes.json'

async function scrapeProductPages(){
    return new Promise( async (resolve, reject) => {
        try{      
                const products_path = '/products'
                const MAX_PAGES = 4

                //if the target directory for product id's by brand dont exist, create it
                if (!fs.existsSync(DATA_DIR)){
                    fs.mkdirSync(DATA_DIR, { recursive: true });  
                }

                console.log("*** scraping surreyvapes ***")

                let page = 1
                let count = 0
                const time_start = Date.now()
  
                do{
                    try{

                        const page_param = `/?page=${page}`
                        const limit_param = '&limit=250'

                        const url = DOMAIN + products_path + page_param + limit_param

                        console.log('scraping ', url)

                        const { data } = await axios.get(url)

                        const products = scrapeProductInfo(data)

                        count = count + products.length
                         
                        utils.writeJSON(DATA_DIR, `page_${page}.json`, products)
                
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))();

                    }catch(err){
                        console.error(err)
                        break
                    }
                }
                while(++page <= MAX_PAGES)

                const time_finish = Date.now()

                console.log("scraped total of ", count, " products across ", page, " pages ")
                console.log("completed scrape in ", (time_finish - time_start)/1000, " seconds")

                resolve()

        }catch(err){
            reject(err)
        }
    })
}

function scrapeProductInfo(html) {

  const $ = cheerio.load(html);
  
  const products = []

  $(".productGrid li").each((idx, el) => {

    const selector = $(el).children("article")

    const product = {
        id:         selector.attr('data-entity-id').trim(),
        name:       selector.attr('data-name').trim(),
        category:   selector.attr('data-product-category').replace(/\s+/g, '').split(',')[2],
        price:      selector.attr('data-product-price').trim(),
        brand:      selector.attr('data-product-brand').trim(),
        img:        $(el).find("img").attr('data-src')
    }

    products.push(product)

  });
    
  console.log("products scraped:", products.length)

  return products
}

function writeInventory(){

    const all_products = []

    fs.readdirSync(DATA_DIR).forEach( (file)=>  
            utils.readJSON(DATA_DIR, file).forEach( (product)=>all_products.push(product)))   
            


    utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, all_products)
}

module.exports = { scrapeProductPages, writeInventory }

