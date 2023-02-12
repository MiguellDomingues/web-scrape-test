const cheerio = require("cheerio");
const utils = require("../utils.js")

const DOMAIN                    = 'https://www.surreyvapes.com'
const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/surreyvapes`

utils.createDirs([DATA_DIR])

const RAW_PRODUCTS_FILE_NAME    = 'raw_products'
const INVENTORY_FILE_NAME       = 'surreyvapes'
const LOG_FILE_NAME             = 'surreyvapes'

const buckets = [
    {
        name: 'Juices',
        synonyms: ['e-juice', //surreyvapes
                   'ejuice',  //ezvape
                   'e-liquid'] //tbvapes
    },
    {
        name: 'Coils',
        synonyms: ['coil','rda','atomizer']
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
        synonyms: ['starter', 'kit','disposable']
    },
    {
        name: 'Mods',
        synonyms: ['boxes', 'boxmod', 'box mod', 'mod', 'box']
    },
    {
        name: 'Batteries',
        synonyms: ['battery', 'batteries','18650']
    },
    {
        name: 'Chargers',
        synonyms: ['charger','charging']
    },
    {
        name: 'Replacement Glass',
        synonyms: ['glass','replacement','pyrex','replacement glass']
    },
    {
        name: 'Accessories/Miscellaneous',
        synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter','screwdriver','tweezer','decorative ring','magnet connector','vaper twizer']
    },      
]

const logger = utils.getLogger(LOG_FILE_NAME)

function scrapeProductInfo(html) {

  const $ = cheerio.load(html);
  
  const products = []

  $(".productGrid li").each((idx, el) => {

    const selector = $(el).children("article")

    const product = {
        id:         selector.attr('data-entity-id').trim(),
        src:        $(el).find("a").attr('href'),
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

function clean(raw_products){

    //console.log(raw_products.length)

    // remove non-vape products, such as rolling-papers, vaporizers, lighters, butane, etc
    // this is acquired from analysis of categories
    let includes = [
        'Accessories,510ThreadBatteries',
        'Accessories,Batteries&Chargers',
        'E-Cigs',
        'E-Juice',]

    let ignore = [
        'Rockit Cruiser']

    raw_products = raw_products
    .filter(                    
        (p) =>              // remove no-category products
            p.category) 
    .map( (p)=>{            // turn PRODUCTS/a/b/c... into a,b,c             
        let arr = p.category.split("/")
        if(arr[0] === 'PRODUCTS') arr.shift()
        let str = arr.join(",")
        p.category = str
        return p })
    .filter(                                                                            
        (p)=>               // only include products that matches at least one of the strings in the includes arr   
            includes.filter( (tag) => p.category.includes(tag) ).length > 0  )
    .filter(                                                                            
        (p)=>               // ignore products with a name that matches least one of the strings in the ignore arr   
            ignore.filter( (tag) => p.name.includes(tag) ).length === 0  ) 
    .map(                           
        (p) => {            // if the item has no brand or a default brand, extract the first word from the name string and set it as the brand
            p.brand = (p.brand === '' || p.brand.includes("The Best Vape Store In Surrey") ) ? p.name.split(" ")[0] : p.brand
            return p})
    .map( 
        (p)=>{              // add product to 0 or more buckets, based on tags/synomyns within each bucket. print no bucket or multibucket matches to log
            p.buckets = utils.getProductBuckets(p.category, p.name, buckets)
            p.buckets.length > 1 && logger.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            p.buckets.length === 0 && logger.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            //console.log(p.buckets , p.name, p.category)
            return p})

    //console.log(raw_products.length)     

    return raw_products

    
}

module.exports = ( () => {
    return new Promise( async (resolve) => {

        const time_start = Date.now()

        try{

            logger.info("**************************executing " +DOMAIN+ " process***********************************************")
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
        const raw_products = (await utils.scrapePages(urls, scrapeProductInfo,logger)).flat()

            //const raw_products = utils.readJSON(DATA_DIR, RAW_PRODUCTS_FILE_NAME, logger)

           // console.log(clean(products))

        utils.writeJSON(DATA_DIR, RAW_PRODUCTS_FILE_NAME, raw_products, logger)
        utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, clean(raw_products), logger)
        
        }catch(err){
            logger.error(err)
        }finally{
            const time_finish = Date.now()
            logger.info("processed " +DOMAIN+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve()
        }
    })
})()
