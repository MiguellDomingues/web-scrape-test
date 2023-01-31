const fs = require('fs');
const utils = require('./utils')

const createProducts = require('./database/create/createProducts.js')

const LOG_FILE_NAME             = 'inventory'

const logger = utils.getLogger(LOG_FILE_NAME)

function cleanSourceProducts(json, source){

    return json.map( (product) => {
        return {
            source:     source,
            source_id:  product.id,
            source_url: `https://${source}.com`,
            name:       product.name,
            img_src:    product.img,
            price:      product.price,
            brand:      product.brand,
            category:   product.category 
        }
    })
}

function addInventoriesToDB(){

    const getFileName = file => file.split('.')[0]
    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR);

    if(inventories_dir.length < 1) return

    const cleaned_products = []

    inventories_dir.forEach( (file)=>{
        cleaned_products.push(cleanSourceProducts(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger), getFileName(file)))
    })
    
   // logger.info(cleaned_products.flat().length)

    createProducts(cleaned_products.flat()).then((db_result)=>{
        logger.info("INSERTED " + db_result.length + " RECORDS")
    }).catch((err)=>{
        logger.error("err from database")
        logger.error(err)
    })      

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

}

module.exports = { addInventoriesToDB }
