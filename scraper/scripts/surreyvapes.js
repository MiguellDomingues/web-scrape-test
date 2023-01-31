const cheerio = require("cheerio");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.surreyvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/surreyvapes`

 //create the root data dir if it does not exist
 //if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });  

 utils.createDirs([DATA_DIR])

const ALL_PRODUCTS_FILE_NAME    = 'products'
const INVENTORY_FILE_NAME       = 'surreyvapes'
const LOG_FILE_NAME             = 'surreyvapes'

const logger = utils.getLogger(LOG_FILE_NAME)

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

module.exports = (async = () => {
    return new Promise( (resolve) => {

        logger.info("**************************executing " +DOMAIN+ " process***********************************************")

        const time_start = Date.now()

        const start_page = 1
        const end_page = 4

        const subpath = 'products'
        const page_param = (page)=>`page=${page}`
        const limit_param = 'limit=250'

        const urls = []

        //generate urls
        for(let page = start_page; page <= end_page; page++)
            urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)
        
        //visit urls, process each url with scraper function, return array of products
        utils.scrapePages(urls, scrapeProductInfo,logger)
        .then( 
            (products) => {
                products = products.flat()
                utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
                utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, products, logger)
        })
        .catch( err => {
            logger.error(err)
        })
        .finally( ()=>{
            const time_finish = Date.now()
            logger.info("processed " +DOMAIN+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve()
        }) 
    })
})()


/*
async function execute(){
    return new Promise( (resolve) => {

        logger.info("**************************executing " +DOMAIN+ " process***********************************************")

        const time_start = Date.now()

        const start_page = 1
        const end_page = 4

        const subpath = 'products'
        const page_param = (page)=>`page=${page}`
        const limit_param = 'limit=250'

        const urls = []

        //generate urls
        for(let page = start_page; page <= end_page; page++)
            urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)
        
        //visit urls, process each url with scraper function, return array of products
        utils.scrapePages(urls, scrapeProductInfo,logger)
        .then( 
            (products) => {
                products = products.flat()
                utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
                utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, products, logger)
        })
        .catch( err => {
            logger.error(err)
        })
        .finally( ()=>{
            const time_finish = Date.now()
            logger.info("processed " +DOMAIN+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve()
        }) 
    })
}

module.exports = { execute }
*/
