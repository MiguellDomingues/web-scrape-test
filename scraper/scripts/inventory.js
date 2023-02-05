const fs = require('fs');
const utils = require('../utils')

const createProducts = require('../../database/create/createProducts.js')

const LOG_FILE_NAME  = 'inventory'

const logger = utils.getLogger(LOG_FILE_NAME)

function normalizeProducts(json, source){

    return json.map( (product) => {
        return {
            source:         source,
            source_id:      product.id,                 //TODO: can i hash a product id into a mongodb id?
            source_url:     `https://${source}.com`,    //TODO: each product needs a direct link to source product page
            last_updated:   '02/04/2023',
            product_info:{
                name:           product.name,               //TODO: 
                img_src:        product.img,                //TODO: need a process that fetches product images and saves them locally
                price:          product.price,              //TODO: remove the $ from some prices
                brand:          product.brand,              //TODO: for brandless products, most name fields contain the brand as the first letter
                category:       product.category            //TODO: split category strings from different vendors into discrete Tags for searching/filtering
            }
        }
    })
}


module.exports = ( () => {

    logger.info("***************** reading JSON files in " + utils.INVENTORIES_DIR+" ********************")

    const getFileName = file => file.split('.')[0]
    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR);

    if(inventories_dir.length < 1){
        logger.error(utils.INVENTORIES_DIR+ " has no files. aborting")
        return
    }

    logger.info("************ files: "+ inventories_dir.map(f => `${getFileName(f)}.json`).join(',') + "********************")

    const normalized_products = []

    inventories_dir.forEach( (file)=>{
        normalized_products.push(normalizeProducts(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger), getFileName(file)))
    })
    
    createProducts(normalized_products.flat()).then((db_result)=>{
        logger.info("INSERTED " + db_result.length + " RECORDS")
    }).catch((err)=>{
        logger.error("err from database")
        logger.error(err)
    })   

})()

/*
function addInventoriesToDB(){

    const getFileName = file => file.split('.')[0]
    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR);

    if(inventories_dir.length < 1) return

    const cleaned_products = []

    inventories_dir.forEach( (file)=>{
        cleaned_products.push(cleanSourceProducts(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger), getFileName(file)))
    })
    
    createProducts(cleaned_products.flat()).then((db_result)=>{
        logger.info("INSERTED " + db_result.length + " RECORDS")
    }).catch((err)=>{
        logger.error("err from database")
        logger.error(err)
    })      

}

module.exports = { addInventoriesToDB }
*/


 /*
    inventories_dir.forEach( async (file)=>{
       
        await createProducts( cleanSourceProducts(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger), getFileName(file)
        )).then((db_result)=>{
            logger.info("INSERTED" + db_result.length + " RECORDS FROM " + file)
        }).catch((err)=>{
            logger.error("err from database")
            logger.error(err)
        })        
        
        
    })
    */
