const fs = require("fs");
const axios = require("axios");

////USE https://www.thunderbirdvapes.com/collections.json?limit=1000 to pull any # of collections in a single call

////USE https://www.thunderbirdvapes.com/collections/all-e-liquids/products.json?limit=2000 to pull any number of items from a collection handle in a single call

//refer to https://shopify.dev/api/admin-rest/2022-10/resources/product 
//and https://shopify.dev/api/admin-rest/2022-10/resources/collection 
//get a list of query parameters available 

/*
    save flattened handle products into raw_pages/shopify/(domain)/products/(handle).json    
*/

async function writeProductsByHandle(domain ,handle, products){

    if(products.length === 0){
        return
    }

    try{     
        const dir = `raw_pages/shopify/${domain.replaceAll('.', '_')}/products`

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        const file_name = `${handle}.json`
        fs.writeFileSync(dir + `/` + file_name, JSON.stringify(products, null, 2) );
       
    }catch(err){
        console.error(err)        
    } 
}

/*
    save flattened collections into raw_pages/shopify/(domain)/collections.json. create dir if it doesnt exists
    collections: arr of arr of objects
*/

function writeCollection(domain, collections){

    try{
        const dir = `raw_pages/shopify/${domain.replaceAll('.', '_')}`

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(dir + `/` + `collections.json`, JSON.stringify(collections, null, 2) );

    }catch(err){
        console.error(err)
    }
}

/*
    fetch 1 to 'max_pages' of collections at (domain)/collections.json?page={1->max_pages}
    with a minimum 1500ms delay between each fetch
    return arr of arrs, each arr representing a fetched page
    if any error, return empty arr
*/

async function fetchCollections(domain){
    return new Promise( async (resolve, reject) => {

        try{
            
            const url = `https://${domain}/collections.json?limit=${1000}`
            const { data } = await axios.get(url);
            resolve(data["collections"])

        }catch(err){
            console.error(err)
            reject([])
        }
    })
}

/*
    read collections.json and retrieive 'handle' key value from each object
    return arr of strings
*/
function readCollectionHandles(domain) {

    let handles =  []

    try{

        const path = `raw_pages/shopify/${domain.replaceAll('.', '_')}/collections.json`
        const json = fs.readFileSync(path, {encoding:'utf8', flag:'r'})
        JSON.parse(json).forEach( (collection) => handles.push(collection.handle));
        
    }catch(err){
        console.error(err)
        return null
    }

    return handles

}

/*
    fetch 1 to 'max_pages' of products at (domain)/collections/products.json?page={1->max_pages}
    with a minimum 1500ms delay between each fetch
    return arr of arrs, each arr representing a fetched page
    if any error, return empty arr
*/
async function fetchProductsByHandle(domain , handle){
    return new Promise( async (resolve, reject) => {
        try{  
            const url = `https://${domain}/collections/${handle}/products.json?limit=${10}`
            const { data } = await axios.get(url);
            resolve(data["products"])

        }catch(err){
            console.error(err)
            reject([])
        }
    })
}

/*
    get all products in (domain)/products dir as a single arr of objects
*/
function readProducts(domain){

    try{
        let products = []

        const dirname = `raw_pages/shopify/${domain.replaceAll('.', '_')}/products`
        const filenames = fs.readdirSync(dirname, { withFileTypes: true } )

        if(filenames.length < 1){
            console.log("error. no products found in ", dirname)
            return []
        }
        
        filenames.forEach(function(filename) {
            const json = fs.readFileSync(dirname + '/' + filename.name, {encoding:'utf8', flag:'r'})
            products.push( JSON.parse(json) ) ;
        })

        return products.flat()

    }catch(err){
        console.error(err)
        return []
    }

}

/*
    read raw shopify product object and parse fields into new object
*/

function parseProduct(product){

    return {
        id:             product.id,
        title:          product.title,
        handle:         product.handle,
        vendor:         product.vendor,
        product_type:   product.product_type,
        src:            product.images && product.images.length > 0 ? product.images[0].src : null,
        variants:       product.variants.map( (variant) => {
            return {
                id:     variant.id,
                title:  variant.title,
                price:  variant.price,
                url:    variant.featured_image && variant.featured_image.src,
            }    
        }),
    }
}

module.exports = { writeProductsByHandle,  writeCollection, fetchCollections, readCollectionHandles, fetchProductsByHandle,  readProducts,  parseProduct }

