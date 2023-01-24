const axios = require("axios");
const fs = require("fs");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.thunderbirdvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/thunderbirdvapes`

const INVENTORY_FILE_NAME       = 'thunderbirdvapes.json'

async function scrapeProductPages(){
    return new Promise( async (resolve, reject) => {
        try{      
                const products_path = 'products.json'
                const MAX_PAGES = 5

                if (!fs.existsSync(DATA_DIR)){
                    fs.mkdirSync(DATA_DIR, { recursive: true });  
                }

                console.log("*** scraping thunderbirdvapes ***")

                let page = 1
                let count = 0
                const time_start = Date.now()
  
                do{
                    try{

                        const page_param = `&page=${page}`
                        const limit_param = '?limit=250'

                        const url = `${DOMAIN}/${products_path}${limit_param}${page_param}`

                        console.log('scraping ', url)

                        const { data } = await axios.get(url)

                        const products = data["products"]

                        if(products.length < 1) break

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

                console.log("scraped total of ", count, " products across ", --page, " pages ")
                console.log("completed scrape in ", (time_finish - time_start)/1000, " seconds")

                resolve()

        }catch(err){
            reject(err)
        }
    })
}

function writeInventory(){

    const all_products = []

    fs.readdirSync(DATA_DIR).forEach( (file)=>  
        utils.readJSON(DATA_DIR, file).forEach( (product)=>all_products.push(parseProduct(product))))
                                
    utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME , all_products)
}

function parseProduct(product){

    return {
        id:             product.id,
        name:           product.title,
        //handle:         product.handle,
        brand:          product.vendor,
        category:       product.product_type,
        img:            product.images && product.images.length > 0 ? product.images[0].src : null,
        price:          product.variants && product.variants.length > 0 ? product.variants[0].price : null
    }
}


module.exports = { scrapeProductPages, writeInventory }