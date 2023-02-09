const cheerio = require("cheerio");
const utils = require("../utils.js")

const DOMAIN                    = 'https://ezvape.com'

const DATA_DIR                  = `${utils.ROOT_DATA_DIR}/ezvape`
const BRANDS_SUBDIR             = `${DATA_DIR}/brands`
const CATEGORIES_SUBDIR         = `${DATA_DIR}/categories`

utils.createDirs([DATA_DIR, BRANDS_SUBDIR, CATEGORIES_SUBDIR])

const ALL_PRODUCTS_FILE_NAME    = 'products'
const BRAND_LINKS_FILE_NAME     = 'brand_links'
const CATEGORY_LINKS_FILE_NAME  = 'category_links'
const LOG_FILE_NAME             = 'ezvape'
const INVENTORY_FILE_NAME       = 'ezvape'

const logger = utils.getLogger(LOG_FILE_NAME)

function scrapeProductIds(html){

    const $ = cheerio.load(html);

    const product_ids = []

    $("#primary .products").children().each( (idx,el) => {
        const id =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-buttons-variations .cart-button a").attr("data-product_id") ; 
        product_ids.push(id)
    })

    return product_ids
}

function scrapeProductsBrandsCategories(html){

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
            const src = $(el).find(".product-wrapper a").attr('href') ;
            const title = $(el).find(".product-wrapper .product-info .product-title-rating a").text()
            const price =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-price .price .amount bdi").first().text()
    
            products_by_id.push({
                id: id,
                src: src,
                title: title,
                img: img,
                price: price
            })
        })
    
        return products_by_id
    
    }
    
    function scrapeCategories(html){
    
        /*
        const $ = cheerio.load(html);
    
        const categories = []
    
        $("#woocommerce_product_categories-4 .product-categories").children().each( (idx,el) => {
    
           categories.push({
                    category: $(el).find("a").filter( (index) => index === 0 ).text(),
                    link: $(el).find("a").attr("href").split("/")[4]
            })                          
        })
        */
    
        //get the nested sub-categories within each category
        function scrapeSubcategories(category, link, slice_index, element){
        
            const appended_category = category + $(element).find("a").filter( (index) => index === 0 ).text() + "/"
            const appended_link = link + $(element).find(">a").attr("href").split("/").slice(slice_index).join("/") 
            categories.push({category: appended_category,link: appended_link}) //TODO: remove the hanging "/" on the last appended string
        
            $(element).find("> .children").children().each( (idx, _el) => scrapeSubcategories(appended_category, appended_link, slice_index+1, _el))           
          }
        
          const $ = cheerio.load(html);
          const categories = []
        
          $("#woocommerce_product_categories-4 .product-categories").children().each( (idx,el) => scrapeSubcategories("", "/", 4, el))
        
    
        
    
        return categories
    }
    

    const items = {}

    items.products = scrapeProductInfo(html)
    items.brands = scrapeBrands(html)
    items.categories = scrapeCategories(html)

    return items
}

function mergeBrandsCategoriesWithProducts(products, brand_product_ids, category_product_ids)
{
    logger.info("**** adding brands and categories to products ****")

    const products_by_id = {}

    products.forEach( product=> products_by_id[product.id] = { name: product.title, img: product.img, price: product.price, src: product.src })

    Object.keys(brand_product_ids).forEach( key => 
        brand_product_ids[key].forEach( id =>
            products_by_id[id] ? products_by_id[id].brand = key : undefined))

    Object.keys(category_product_ids).forEach( key => 
        category_product_ids[key].forEach( id => 
            products_by_id[id] ?  products_by_id[id].category =  key : undefined))


    let pc_c = 0, Pc_c = 0, pC_c = 0, PC_c = 0, p_c = 0

    const merged_products = []

    Object.keys(products_by_id).forEach( (key)=>{

        const product = products_by_id[key]

        if(!('category' in product) && !('brand' in product)) pc_c++       
        if('category' in product  && !('brand' in product))Pc_c++
        if(!('category' in product)  && 'brand' in product)pC_c++
        if('category' in product  && 'brand' in product) PC_c++
        if(product.price.length === 0 ) p_c++

        merged_products.push( {id: key, ...product} )
    })

    logger.info("products count: "+ Object.keys(products_by_id).length )
    logger.info("products without category and without brand: "+ pc_c,)
    logger.info("products with category and without brand: "+ Pc_c,)
    logger.info("products without category and with brand: "+ pC_c,)
    logger.info("products with category and with brand: "+ PC_c,)
    logger.info("products without price: "+ p_c,)

    return merged_products
}

async function getProductIdsByBrand(brand_links){

    if(brand_links === undefined || brand_links.length === 0)
        throw new Error("brand_links can not be undefined or an empty arr")

    const subpath = 'brand'
    const param = `per_page=300`
    const urls = brand_links.map( brands => `${DOMAIN}/${subpath}/${brands.link}?${param}`)

    const product_ids_by_brand = {}
    const product_ids = await utils.scrapePages(urls, scrapeProductIds, logger)
    product_ids.forEach( (product_ids, idx) => product_ids_by_brand[brand_links[idx].brand] = product_ids)

    return product_ids_by_brand
}

async function getProductIdsByCategory(category_links){

    if(category_links === undefined || category_links.length === 0)
        throw new Error("category_links can not be undefined or an empty arr")

    subpath = 'buy-vapes-online'
    param = `per_page=300`
    urls = category_links.map( categories => `${DOMAIN}/${subpath}${categories.link}?${param}`)

    const product_ids_by_category = {}
    const product_ids = await utils.scrapePages(urls, scrapeProductIds, logger)
    product_ids.forEach( (product_ids, idx) => product_ids_by_category[category_links[idx].category] = product_ids)

    return product_ids_by_category
}

async function getProductsAndBrandCategoryLinks(){

    const subpath = 'shop/'
    const param = 'per_page=1000'
    const urls = [`${DOMAIN}/${subpath}?${param}`]

    let json = await utils.scrapePages(urls, scrapeProductsBrandsCategories, logger)

    return json[0]
}

function clean(raw_products){

    let includes = [
        'eJuice',
        'Vape Kits',
        'Tanks & Rebuildables',
        'Pods & Coils',
        'E-Juice',
        'Box Mods',
        'Accessories',]

    return raw_products
    .filter( 
        p => p.price && p.price.trim() != "")     /// remove products which have no price
    .map( 
        p => {p.price = p.price.replace("$", "") ///  remove '$' from price string
        return p})
    .filter(                                                                             
        (p) => 'category' in p )                // remove products which have no category
    .map( product => {
           product.category = product.category.split("/")   //remove tailing '/'
           product.category.pop()
           product.category = product.category.join(",")
        return product})
    .filter(                                                                              
        (p)=> includes.filter( (tag) => p.category.includes(tag) ).length > 0 ) // remove products that are not part of specific categories
}

module.exports = ( () => {
    return new Promise( async (resolve) => {
        const time_start = Date.now()
        logger.info("**************************executing " +DOMAIN+ " process***********************************************")

        try{
            
            ///////////////////stage 1////////////////////////////////// scrape the product id/img/price/name without category/brands; scrape the category/brand links

              /*
            const json = await getProductsAndBrandCategoryLinks()

            const {products, brands, categories } = json

            console.log(products)

            utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
           
            utils.writeJSON(BRANDS_SUBDIR, BRAND_LINKS_FILE_NAME, brands, logger)
            utils.writeJSON(CATEGORIES_SUBDIR, CATEGORY_LINKS_FILE_NAME, categories, logger)

            ////////////////////stage 2.a////////////////////////////////// visit each category url; scrape the product ids

            const product_ids_by_category = await getProductIdsByCategory(categories)
            utils.writeJSON(CATEGORIES_SUBDIR, 'category_product_ids.json', product_ids_by_category, logger)

            // const products = utils.readJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, logger)
            //const product_ids_by_category = utils.readJSON(CATEGORIES_SUBDIR, 'category_product_ids', logger)
            //const product_ids_by_brand = utils.readJSON(BRANDS_SUBDIR, 'brand_product_ids', logger)

            ////////////////////stage 2.b////////////////////////////////// visit the each brand url; scrape the product ids

            const product_ids_by_brand = await getProductIdsByBrand(brands)
            utils.writeJSON(BRANDS_SUBDIR, 'brand_product_ids.json', product_ids_by_brand, logger)

            ////////////////////////////////////// stage 3//////////////////////////////////////////////// merge the products with brand/category by id
*/
           const products = utils.readJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, logger)
            const product_ids_by_category = utils.readJSON(CATEGORIES_SUBDIR, 'category_product_ids', logger)
            const product_ids_by_brand = utils.readJSON(BRANDS_SUBDIR, 'brand_product_ids', logger)

            const merged_products = mergeBrandsCategoriesWithProducts(products, product_ids_by_brand, product_ids_by_category)


            utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, clean(merged_products), logger)
        }
        catch(err){
            logger.error(err)
        }
        finally{
            const time_finish = Date.now()
            logger.info("processed " +DOMAIN+ " execution in " +  (time_finish - time_start)/1000 + " seconds")    
            resolve()  
        }
    })
})()

/*
async function execute(){

    const time_start = Date.now()
    logger.info("**************************executing " +DOMAIN+ " process***********************************************")

    try{
        ///////////////////stage 1//////////////////////////////////
        //const json = await getProductsAndBrandCategoryLinks()

       // const {products, brands, categories } = json
       
       // utils.writeJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, products, logger)
       // utils.writeJSON(BRANDS_SUBDIR, BRAND_LINKS_FILE_NAME, brands, logger)
        //utils.writeJSON(CATEGORIES_SUBDIR, CATEGORY_LINKS_FILE_NAME, categories, logger)

        

        ////////////////////stage 2.a//////////////////////////////////

        //const product_ids_by_category = await getProductIdsByCategory(categories)

        //console.log(product_ids_by_category)
        //utils.writeJSON(CATEGORIES_SUBDIR, 'category_product_ids.json', product_ids_by_category, logger)

        //const products = utils.readJSON(DATA_DIR, ALL_PRODUCTS_FILE_NAME, logger)
        //const product_ids_by_category = utils.readJSON(CATEGORIES_SUBDIR, 'category_product_ids', logger)
        //const product_ids_by_brand = utils.readJSON(BRANDS_SUBDIR, 'brand_product_ids', logger)


        ////////////////////stage 2.b//////////////////////////////////

        //const product_ids_by_brand = await getProductIdsByBrand(brands)
       // utils.writeJSON(BRANDS_SUBDIR, 'brand_product_ids.json', product_ids_by_brand, logger)

        ////////////////////////////////////// stage 3////////////////////////////////////////////////

        

    const merged_products = mergeBrandsCategoriesWithProducts(products, product_ids_by_brand, product_ids_by_category)

    
    
    utils.writeJSON(utils.INVENTORIES_DIR, INVENTORY_FILE_NAME, merged_products, logger)
    }
    catch(err){
        logger.error(err)
    }
    finally{
        const time_finish = Date.now()
        logger.info("processed " +DOMAIN+ " execution in " +  (time_finish - time_start)/1000 + " seconds")      
    }
}

module.exports = { execute }
*/
/*

const html = fs.readFileSync('test.html', {encoding:'utf8', flag:'r'})
function f1(html){

  function scrapeSubcategories(category, link, slice_index, element){
    
    const appended_category = category + $(element).find("a").filter( (index) => index === 0 ).text() + "/"
    const appended_link = link + $(element).find(">a").attr("href").split("/").slice(slice_index).join("/") 
    categories.push({category: appended_category,link: appended_link})

    $(element).find("> .children").children().each( (idx, _el) => scrapeSubcategories(appended_category, appended_link, slice_index+1, _el))           
  }

  const $ = cheerio.load(html);
  const categories = []

  $(".product-categories").children().each( (idx,el) => scrapeSubcategories("", "/", 4, el))

  console.log(categories)
}




  function f2(html){

  const $ = cheerio.load(html);

  const categories = []

  $(".product-categories").children().each( (idx,el) => {

    const category = $(el).find("a").filter( (index) => index === 0 ).text()
    const link = $(el).find("a").attr("href").split("/")[4]
    const subcategories = []

    function scrapeSubcategories(category, link, slice_index, element){
      $(element).find("> .children").children().each( (idx, _el) => { 
          const appended_category = category + "/" + $(_el).find("a").filter( (index) => index === 0 ).text() 
          const appended_link = link+ "/" + $(_el).find(">a").attr("href").split("/").slice(slice_index).join("/")
          subcategories.push({category: appended_category,link: appended_link})
          scrapeSubcategories(appended_category, appended_link, ++slice_index, _el)
      })   
    }

    scrapeSubcategories(category, link, 4, el)

    categories.push({
      category: category,
      link: link,
      subcategories: subcategories
    })         
  })

  let x = 0

  categories.forEach( (a)=>{
    x = x + a.subcategories.length
  })

  console.log( x + categories.length)

}

f1(html)

*/
