const fs = require("fs");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.thunderbirdvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/thunderbirdvapes`

const ALL_PRODUCTS_FILE_NAME    = 'products.json'
const INVENTORY_FILE_NAME       = 'thunderbirdvapes.json'
const LOG_FILE_NAME             = 'thunderbirdvapes.txt'

const logger = utils.Logger(LOG_FILE_NAME)

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

    const time_start = Date.now()

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
    utils.scrapePages(urls, json=>json["products"],logger)
    .then( 
        (products) => {
            utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
            utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, products.map( product=>parseProduct(product)), logger)
    })
    .catch( (err) => console.error(err))
    .finally( ()=>{
        const time_finish = Date.now()
        console.log("completed " +DOMAIN+ " scrape in " + (time_finish - time_start)/1000 + " seconds")
        logger.end() 
    }  )
}

module.exports = { execute }