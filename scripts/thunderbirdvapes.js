const axios = require("axios");
const fs = require("fs");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.thunderbirdvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/thunderbirdvapes`

const ALL_PRODUCTS_FILE_NAME    = 'products.json'
const INVENTORY_FILE_NAME       = 'thunderbirdvapes.json'
const LOG_FILE_NAME             = 'thunderbirdvapes.txt'

const logger = utils.Logger(LOG_FILE_NAME)

async function scrapeProductPages(urls, scraper){
    return new Promise( async (resolve, reject) => {
        try{      
                logger.writeln("*** scraping " + DOMAIN + " ***")          
                const time_start = Date.now()
                const scraped_pages = []

                for (const url of urls){
                    try{
                        const { data } = await axios.get(url)
                        const scraped_json = scraper(data)

                        if(scraped_json.length === 0) 
                            break

                        logger.writeln("scraped "+ scraped_json.length + " items from "+ url)
                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))()
                    }catch(err){
                        logger.writeln("error scraping "+ url)
                        break
                    }           
                }

                const flat = scraped_pages.flat()        
                const time_finish = Date.now()

                logger.writeln("completed scrape in " + (time_finish - time_start)/1000 + " seconds")
                logger.writeln("pages: " + scraped_pages.length + "/" + urls.length)
                logger.writeln("items scraped: " + flat.length)
  
                resolve(flat)

        }catch(err){
            reject(err)
        }
    })
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


async function execute(){

    const start_page = 1
    const end_page = 6

    const subpath = 'products.json'
    const page_param = (page)=>`page=${page}`
    const limit_param = 'limit=250'

    
    //create the root data dir if it does not exist
    if (!fs.existsSync(DATA_DIR)){
        fs.mkdirSync(DATA_DIR, { recursive: true });  
    }

    const urls = []

    //generate urls
    for(let page = start_page; page <= end_page; page++)
        urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)
    
    //visit urls, process each url with scraper function, return array of products
    scrapeProductPages(urls, json=>json["products"])
    .then( 
        (products) => {
            utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
            utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, products.map( product=>parseProduct(product)), logger)
    })
    .catch( (err) => console.error(err))
    .finally(  _=>logger.end())    
}

module.exports = { execute }












/*
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

*/