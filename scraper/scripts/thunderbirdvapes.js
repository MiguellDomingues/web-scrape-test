const utils = require("../utils.js")

const DOMAIN                    = 'https://www.thunderbirdvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/thunderbirdvapes`

//create the root data dir if it does not exist
utils.createDirs([DATA_DIR])

const ALL_PRODUCTS_FILE_NAME    = 'products'
const INVENTORY_FILE_NAME       = 'thunderbirdvapes'
const LOG_FILE_NAME             = 'thunderbirdvapes'

const logger = utils.getLogger(LOG_FILE_NAME)

function clean(raw_products){

    let includes = [
        'E-Liquid',
        'Hardware',
        'Wicks & Wire', 
        'Replacement Glass', 
        'Pods',
        'Open System',
        'Closed System',
        'Coils',
        'Chargers', 
        'Batteries',]

        return raw_products
        .map( (p)=>{
            p.product_type = p.product_type.split(" - ").join(",")
            return p
        })
        .filter(                                                                              
            (p)=> includes.filter( (tag) => p.product_type.includes(tag) ).length > 0 )
        .map( (p)=>{
            return {
                id:             p.id,  
                name:           p.title,
                src:            `${DOMAIN}/products/${p.handle}`,    
                brand:          p.vendor,
                category:       p.product_type,
                img:            p.images && p.images.length > 0 ? p.images[0].src : null,
                price:          p.variants && p.variants.length > 0 ? p.variants[0].price : null
            }
        })

    //TODO: the 'tag' array has lots of descriptive tags that would simplify categorizing/branding products from shopify-based stores
}

module.exports = ( () => {
    return new Promise( async (resolve) => {
        logger.info("**************************executing " +DOMAIN+ " process***********************************************")

        const time_start = Date.now()

        try{
            const start_page = 1
            const end_page = 6

            const subpath = 'products.json'
            const page_param = (page)=>`page=${page}`
            const limit_param = 'limit=250'

            const urls = []

            //generate urls
            for(let page = start_page; page <= end_page; page++)
                urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)
        
            //visit urls, process each url with scraper function, return array of array of products
            //const products = (await utils.scrapePages(urls, json=>json["products"],logger)).flat()
           
            //utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
            const products = utils.readJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, logger)

           //console.log(clean(products))


            utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, clean(products) , logger)

        }catch(err){
            logger.error(err)
        }finally{
            const time_finish = Date.now()
            logger.info("processed " +DOMAIN+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve() 
        }
    })
})()


/*
async function execute(){

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
}

module.exports = { execute }

*/
