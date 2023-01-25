const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.surreyvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/surreyvapes`

const ALL_PRODUCTS_FILE_NAME    = 'products.json'
const INVENTORY_FILE_NAME       = 'surreyvapes.json'
const LOG_FILE_NAME             = 'surreyvapes.txt'

const logger = utils.Logger(LOG_FILE_NAME)

async function scrapePages(urls, scraper){
    return new Promise( async (resolve, reject) => {
        try{      
                //console.log("*** scraping surreyvapes ***")
                logger.writeln("*** scraping " + DOMAIN + " ***")
                
                const time_start = Date.now()

                const scraped_pages = []

                for (const url of urls){
                    try{
                        const { data } = await axios.get(url)
                        const scraped_json = scraper(data)
                        if(scraped_json.length === 0) break
                        logger.writeln("scraped "+ scraped_json.length + " items from "+ url)
                        //console.log("scraped ", scraped_json.length , " items from ", url)
                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))()
                    }catch(err){
                        logger.writeln("error scraping "+ url)
                        //console.error(err)
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
    
  return products
}


async function execute(){

    const start_page = 1
    const end_page = 4

    const subpath = 'products'
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
    scrapePages(urls, scrapeProductInfo)
    .then( 
        (products) => {
            utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
            utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, products, logger)
    })
    .catch( err => console.error(err))
    .finally(  _=>logger.end())  
}

module.exports = { execute }










/*

function writeInventory(){

    const all_products = []

    fs.readdirSync(DATA_DIR).forEach( (file)=>  
            utils.readJSON(DATA_DIR, file, logger).forEach( (product)=>all_products.push(product)))   
            
    utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, all_products, logger)
}





async function scrapePages(){
    return new Promise( async (resolve, reject) => {
        try{      
                const products_path = '/products'
                const MAX_PAGES = 4

                //console.log("*** scraping surreyvapes ***")
                logger.write("*** scraping surreyvapes ***")

                let page = 1
                let count = 0
                const time_start = Date.now()
  
                do{
                    try{

                        const page_param = `/?page=${page}`
                        const limit_param = '&limit=250'

                        const url = DOMAIN + products_path + page_param + limit_param

                        //console.log('scraping ', url)
                        logger.write('scraping '+ url)

                        const { data } = await axios.get(url)

                        const products = scrapeProductInfo(data)

                        count = count + products.length
                         
                        utils.writeJSON(DATA_DIR, `page_${page}.json`, products, logger)
                
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))();

                    }catch(err){
                        console.error(err)
                        break
                    }
                }
                while(++page <= MAX_PAGES)

                const time_finish = Date.now()

                //console.log("scraped total of ", count, " products across ", page, " pages ")
                logger.write("scraped total of "+ count+ " products across "+ page+ " pages ")
                //console.log("completed scrape in ", (time_finish - time_start)/1000, " seconds")
                logger.write("completed scrape in "+ (time_finish - time_start)/1000+ " seconds")

                resolve()

        }catch(err){
            reject(err)
        }
    })
}

*/

