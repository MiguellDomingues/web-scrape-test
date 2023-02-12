const utils = require("../utils.js")

const DOMAIN                    = 'https://www.thunderbirdvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/thunderbirdvapes`

//create the root data dir if it does not exist
utils.createDirs([DATA_DIR])

const RAW_PRODUCTS_FILE_NAME    = 'products'
const INVENTORY_FILE_NAME       = 'thunderbirdvapes'
const LOG_FILE_NAME             = 'thunderbirdvapes'

const logger = utils.getLogger(LOG_FILE_NAME)

const buckets = [
    {
        name: 'Juices',
        synonyms: ['e-juice', //surreyvapes
                   'ejuice',  //ezvape
                   'e-liquid'] //tbvapes
    },
    {
        name: 'Coils',
        synonyms: ['coil','rda','atomizer','RPM 40 Pod','Ego 1 Coil 1.0 Ohm 5/Pk','Metal RDA Stand','Crown 5 Coil']
    },
    {
        name: 'Pods',
        synonyms: ['pod',]
    },
    {
        name: 'Tanks',
        synonyms: ['tank','clearomizer']
    },
    {
        name: 'Starter Kits',
        synonyms: ['starter', 'kit','disposable','disposables']
    },
    {
        name: 'Mods',
        synonyms: ['boxes', 'boxmod', 'box mod', 'mod', 'box', 'Aegis Legend 2 200W Mod']
    },
    {
        name: 'Batteries',
        synonyms: ['battery', 'batteries','18650','18650','Evod 650mAh Battery']
    },
    {
        name: 'Chargers',
        synonyms: ['charger','charging','lush q4 charger','evod usb charger','Intellicharger I4 V2 Li-Ion/Nimh','Battery Charger','Wall Adapter','Power Bank']
    },
    {
        name: 'Replacement Glass',
        synonyms: ['glass','replacement','pyrex','replacement glass','dotAIO V2 Replacement Tank']
    },
    {
        name: 'Accessories/Miscellaneous',
        synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter',
        'screwdriver','tweezer','decorative ring','magnet connector','vaper twizer','diy tool kit','Clapton Coil Building Kit','Zipper Storage Bag','Mouthpiece Glass']
    }
]

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

        raw_products = raw_products
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
        .map( 
            (p)=>{              // add product to 0 or more buckets, based on tags/synomyns within each bucket. print no bucket or multibucket matches to log
                p.buckets = utils.getProductBuckets(p.category, p.name, buckets)
                p.buckets.length > 1 && logger.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
                p.buckets.length === 0 && logger.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
                //console.log(p.buckets , p.name, p.category)
                return p})

    //TODO: the 'tag' array has lots of descriptive tags that would simplify categorizing/branding products from shopify-based stores
    return raw_products
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
           // const products = (await utils.scrapePages(urls, json=>json["products"],logger)).flat()
           
            //utils.writeJSON(DATA_DIR, RAW_PRODUCTS_FILE_NAME, products, logger)
            const products = utils.readJSON(DATA_DIR, RAW_PRODUCTS_FILE_NAME, logger)

           clean(products)


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
