const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const utils = require("../utils.js")

const DOMAIN                    = 'https://ezvape.com'

const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/ezvape`

const BRANDS_SUBDIR             = `${DATA_DIR}/brands`
const CATEGORIES_SUBDIR         = `${DATA_DIR}/categories`

const ALL_PRODUCTS_FILE_NAME    = 'products.json'
const BRAND_LINKS_FILE_NAME     = 'brand_links.json'
const CATEGORY_LINKS_FILE_NAME  = 'category_links.json'
const INVENTORY_FILE_NAME       = 'ezvape.json'

const LOG_FILE_NAME             = 'thunderbirdvapes.txt'

const logger = utils.Logger(LOG_FILE_NAME)


function scrapeBrands(html){

    const $ = cheerio.load(html);

    const brands = []

    $("#kapee-product-brand-2 .kapee_product_brands").children().each( (idx,el) => {

       if(idx !== 0){
            brands.push({
                brand: $(el).find("a").text(),
                link: $(el).find("a").attr("href").split("/")[4]
            })                 
        }      
    })

    return brands
}

function scrapeProductInfo(html){

    const $ = cheerio.load(html);

    const products_by_id = []

    $("#primary .products").children().each( (idx,el) => {

        const id =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-buttons-variations .cart-button a").attr("data-product_id") ;
        const img = $(el).find(".product-wrapper .product-image a img").attr('src') ;
        const title = $(el).find(".product-wrapper .product-info .product-title-rating a").text()
        const price =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-price .price .amount bdi").first().text()

        products_by_id.push({
            id: id,
            title: title,
            img: img,
            price: price
        })
    })

    return products_by_id

}

function scrapeCategories(html){

    const $ = cheerio.load(html);

    const categories = []

    $("#woocommerce_product_categories-4 .product-categories").children().each( (idx,el) => {

       categories.push({
                category: $(el).find("a").filter( (index) => index === 0 ).text(),
                link: $(el).find("a").attr("href").split("/")[4]
        })                          
    })

    return categories
}

function scrapeProductIds(html){

    const $ = cheerio.load(html);

    const product_ids = []

    $("#primary .products").children().each( (idx,el) => {
        const id =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-buttons-variations .cart-button a").attr("data-product_id") ; 
        product_ids.push(id)
    })

    return product_ids
}

function parseProducts(products_by_id){

    const inventory = []

    Object.keys(products_by_id).forEach( (id)=>{
        const obj = products_by_id[id]

        'category' in obj && 'title' in obj && 'img' in obj && 'price' in obj && 
         obj.price.length > 0 && inventory.push( {id: id, ...obj} )
    })

    return inventory
}

async function scrapePages(urls, scraper){
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

                       // logger.writeln("scraped "+ 
                         //   scraped_json.length ? 
                            //    scraped_json.length+" items" : 
                       /    //    Object.keys(scraped_json).length+" keys"  
                       // + " from "+ url)
                       console.log("scraped")

                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))()
                    }catch(err){
                        logger.writeln("error scraping "+ url)
                        break
                    }           
                }

                //const flat = scraped_pages.flat()        
                const time_finish = Date.now()

                logger.writeln("completed scrape in " + (time_finish - time_start)/1000 + " seconds")
                logger.writeln("pages: " + scraped_pages.length + "/" + urls.length)
                //logger.writeln("items scraped: " + flat.length)
  
                resolve(scraped_pages)

        }catch(err){
            reject(err)
        }
    })
}


function scrapeProductsBrandsCategories(html){

    const items = {}

    items.products = scrapeProductInfo(html)
    items.brands = scrapeBrands(html)
    items.categories = scrapeCategories(html)

    return items
}


/*
async function scrapeProductsBrandsCategories(){
    return new Promise( async (resolve, reject) => {

        try{

            const limit = 1000
                                                                                                
            if (!fs.existsSync(DATA_DIR)){
                fs.mkdirSync(DATA_DIR, { recursive: true });  
            }

            //perform a scrape of limit items, brands and categories, save the outputs as json
            const url = DOMAIN + `/shop/?per_page=${limit}`

            const { data } = await axios.get(url)
                
            utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, scrapeProductInfo(data))
            utils.writeJSON(DATA_DIR, BRAND_LINKS_FILE_NAME, scrapeBrands(data))
            utils.writeJSON(DATA_DIR, CATEGORY_LINKS_FILE_NAME, scrapeCategories(data))
          
            resolve()

        }catch(err){
            reject(err)
        }
    })
}
*/

async function scrapeProductBrands(){
    return new Promise( async (resolve, reject) => {

        try{
            const MAX_ERRORS = 3

            const brand_path = '/brand/'

            //if the source files for products and brand names/paths dont exist, output an error
            if (!fs.existsSync(DATA_DIR + '/' + BRAND_LINKS_FILE_NAME)){
                throw new Error('missing file: ', BRAND_LINKS_FILE_NAME)
            }
            //if the target directory for product id's by brand dont exist, create it
            if (!fs.existsSync(BRANDS_SUBDIR)){
                fs.mkdirSync(BRANDS_SUBDIR, { recursive: true });  
            }

            //read the brand list containing the name and path as a json
            const brand_links = utils.readJSON(DATA_DIR, BRAND_LINKS_FILE_NAME)

            let errors = 0
            let count = 0
            const time_start = Date.now()
            
            //for each brand name/path
            for (const brand of brand_links){

                try{

                    const name = brand.brand
    
                    const url = DOMAIN + brand_path + brand.link + `?per_page=${100}`
    
                    console.log('scraping ', url)
    
                    //visit the page and grab the html
                    const { data } = await axios.get(url)
    
                    //get all the product ids on that brand page
                    const brand_product_ids = scrapeProductId(data)

                    count = count + brand_product_ids.length
    
                    //write the brand product ids into a json file in the /brands folder  
                    utils.writeJSON(BRANDS_SUBDIR, `${name}.json`, brand_product_ids)

                }catch(err){
                    console.error(err)

                    if(++errors > MAX_ERRORS) break
                }
                
                await (() => new Promise(resolve => setTimeout(resolve, 2500)))();
            }

            const time_finish = Date.now()

            console.log("scraped total of ", count, " product ids across ", brand_links.length, " brands ")
            console.log(errors, " errors")
            console.log(" completed scrape in ", (time_finish - time_start)/1000, " seconds")

            resolve()

        }catch(err){
            reject(err)
        }
    })
}

async function scrapeProductCategories(){
    return new Promise( async (resolve, reject) => {

        try{
            const MAX_ERRORS = 3

            const category_path = '/buy-vapes-online/'

            //if the source files for products and brand names/paths dont exist, output an error
            if (!fs.existsSync(DATA_DIR + '/' + CATEGORY_LINKS_FILE_NAME)){
                throw new Error('missing file: ', CATEGORY_LINKS_FILE_NAME)
            }
            //if the target directory for product id's by brand dont exist, create it
            if (!fs.existsSync(CATEGORIES_SUBDIR)){
                fs.mkdirSync(CATEGORIES_SUBDIR, { recursive: true });  
            }

            //read the brand list containing the name and path as a json
            const category_links = utils.readJSON(DATA_DIR, CATEGORY_LINKS_FILE_NAME)

            let errors = 0
            let count = 0
            const time_start = Date.now()

            console.log('****** scraping product ids ******')
            
            //for each brand name/path
            for (const category of category_links){

                try{

                    const name = category.category
    
                    const url = DOMAIN + category_path + category.link + `?per_page=${300}`
    
                    console.log('scraping ', url)
    
                    //visit the page and grab the html
                    const { data } = await axios.get(url)
    
                    //get all the product ids on that brand page
                    const category_product_ids = scrapeProductId(data)

                    count = count + category_product_ids.length
    
                    //write the brand product ids into a json file in the /brands folder  
                    utils.writeJSON(CATEGORIES_SUBDIR, `${name}.json`, category_product_ids)

                }catch(err){
                    console.error(err)

                    if(++errors > MAX_ERRORS) break
                }
                
                await (() => new Promise(resolve => setTimeout(resolve, 2500)))();
            }

            const time_finish = Date.now()

            console.log("scraped total of ", count, " product ids across ", category_links.length, " categories ")
            console.log(errors, " errors")
            console.log(" completed scrape in ", (time_finish - time_start)/1000, " seconds")

            resolve()

        }catch(err){
            reject(err)
        }
    })
}

function writeInventory(){

    try{

        if (!fs.existsSync(DATA_DIR + '/' + ALL_PRODUCTS_FILE_NAME) ){
                throw new Error('missing file ',ALL_PRODUCTS_FILE_NAME, " in ", DATA_DIR)
        }
        
        const products_by_id = {}
    
        utils.readJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME).forEach( (product)=>
            products_by_id[product.id] = { title: product.title, img: product.img, price: product.price })

        console.log("loaded ", Object.keys(products_by_id).length, " products")

        fs.readdirSync(BRANDS_SUBDIR).forEach( (file)=>  
            utils.readJSON(BRANDS_SUBDIR, file).forEach( (id)=>                                                                             // for each (brand).json file in the /brands folder...                    // ... for each of the id's read from the (brands).json file
                products_by_id[id] ? products_by_id[id].brand = file.split('.')[0] : undefined))                                 //    ... if the id matches a key in the products_by_id object
                                                                                                                                  // write the brand to the object. 
      
        fs.readdirSync(CATEGORIES_SUBDIR).forEach( (file)=>  
            utils.readJSON(CATEGORIES_SUBDIR, file).forEach( (id)=>                                                                       // for each (category).json file in the /categories folder...                  // ... for each of the id's read from the (category).json file
                products_by_id[id] ? products_by_id[id].category = file.split('.')[0] : undefined)) 
                                                                                                                                   //    ... if the id matches a key in the products_by_id object
                                                                                                                                   // write the category to the object.   
        utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, parseProducts(products_by_id))

    }catch(err){
        console.error(err)
    }
}

async function execute(){

    const start_page = 1
    const end_page = 1

    

    //const url = DOMAIN + `/shop/?per_page=${limit}`

    const subpath = 'shop/'
    const param = 'per_page=1000'

    
    //create the root data dir if it does not exist
    if (!fs.existsSync(DATA_DIR)){
        fs.mkdirSync(DATA_DIR, { recursive: true });  
    }

    //const urls = 
    //const url = [`${DOMAIN}/${subpath}?${param}`]
    //urls.push(url)

    //generate urls
    //for(let page = start_page; page <= end_page; page++)
       // urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)
    
    //visit urls, process each url with scraper function, return array of products
    scrapePages([`${DOMAIN}/${subpath}?${param}`], scrapeProductsBrandsCategories)
    .then( 
        async (json) => {
            const products   = json[0].products
            const brands     = json[0].brands
            const categories = json[0].categories
            
            utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
            utils.writeJSON(DATA_DIR, BRAND_LINKS_FILE_NAME, brands, logger)
            utils.writeJSON(DATA_DIR, CATEGORY_LINKS_FILE_NAME, categories, logger)

            const subpath = 'buy-vapes-online'
            const param = `per_page=300`
            const urls = categories.map( categories => `${DOMAIN}/${subpath}/${categories.link}?${param}` )

            //console.log(urls)

            const products_by_id = {}
    
            products.forEach( (product)=> products_by_id[product.id] = { title: product.title, img: product.img, price: product.price })

            await scrapePages(urls, scrapeProductIds).forEach( (category_ids, idx)=>
                category_ids.forEach( (id) => products_by_id[id] ? products_by_id[id].category = categories[idx].category : undefined )
            )
           
            


            
            
    
            //const url = DOMAIN + category_path + category.link + `per_page=300`

            //generate urls
            //for(let page = start_page; page <= end_page; page++)
            // urls.push(`${DOMAIN}/${subpath}?${limit_param}&${page_param(page)}`)


            
    })
    .catch( (err) => console.error(err))
    .finally(  _=>logger.end())    
}

module.exports = { execute }

