const utils = require("../utils.js")

const DOMAIN                    = 'https://www.thunderbirdvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/thunderbirdvapes`

//create the root data dir if it does not exist
utils.createDirs([DATA_DIR])

const ALL_PRODUCTS_FILE_NAME    = 'products'
const INVENTORY_FILE_NAME       = 'thunderbirdvapes'
const LOG_FILE_NAME             = 'thunderbirdvapes'

const logger = utils.getLogger(LOG_FILE_NAME)

function parseProduct(product){
    //TODO: the 'tag' array has lots of descriptive tags that would simplify categorizing/branding products from shopify-based stores
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

module.exports = (async = () => {
    return new Promise( (resolve) => {
        logger.info("**************************executing " +DOMAIN+ " process***********************************************")

        const time_start = Date.now()

        const start_page = 1
        const end_page = 6

        const subpath = 'products.json'
        const page_param = (page)=>`page=${page}`
        const limit_param = 'limit=250'

        const urls = []

        //generate urls
        for(let page = start_page; page <= end_page; page++)
            urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)
        
        //visit urls, process each url with scraper function, return array of products
        utils.scrapePages(urls, json=>json["products"],logger)
        .then( 
            (products) => {
                products = products.flat()
                utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
                utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, products.map( product=>parseProduct(product)), logger)
        })
        .catch( (err) => logger.error(err))
        .finally( ()=>{
            const time_finish = Date.now()
            logger.info("processed " +DOMAIN+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve() 
        })
    })
})()
