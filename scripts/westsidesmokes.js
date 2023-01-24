const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");


const DOMAIN                    = 'https://westsidesmokes.ca'

const DATA_DIR                  = `./raw_pages/westsidesmokes`
const INVENTORIES_DIR           = './inventories'

async function scrapeProductPages(){
    return new Promise( async (resolve, reject) => {
        try{      
                const products_path = 'products.json'
                const MAX_PAGES = 5

                if (!fs.existsSync(DATA_DIR)){
                    fs.mkdirSync(DATA_DIR, { recursive: true });  
                }

                console.log("*** scraping thunderbirdvapes ***")

                let page = 1
                let count = 0
                const time_start = Date.now()
  
                do{
                    try{

                        const page_param = `&page=${page}`
                        const limit_param = '?limit=250'

                        const url = `${DOMAIN}/${products_path}${limit_param}${page_param}`

                        console.log('scraping ', url)

                        const { data } = await axios.get(url)

                        const products = data["products"]

                        if(products.length < 1) break

                        count = count + products.length
                         
                        writeJSON(DATA_DIR, `page_${page}.json`, products)
                
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))();

                    }catch(err){
                        console.error(err)
                        break
                    }
                }
                while(++page <= MAX_PAGES)

                const time_finish = Date.now()

                console.log("scraped total of ", count, " products across ", --page, " pages ")
                console.log("completed scrape in ", (time_finish - time_start)/1000, " seconds")

                resolve()

        }catch(err){
            reject(err)
        }
    })
}

function writeJSON(dir, file_name, json){
    const path = dir + `/` + file_name
    fs.writeFileSync(path, JSON.stringify(json, null, 2) );
    console.log("wrote ", json.length, " items into ", path)
}


function readJSON(dir, file_name){
    const path = dir + `/` + file_name
    const json = JSON.parse(fs.readFileSync(dir + '/' + file_name, {encoding:'utf8', flag:'r'}))
    console.log("read ", json.length, " items from ", path)
    return json
}

function writeInventory(){

    const all_products = []

    fs.readdirSync(DATA_DIR).forEach( (file)=>  
            readJSON(DATA_DIR, file).forEach( (products)=>all_products.push(products)))   
            
    console.log(all_products.flat().length)        
    //writeJSON(INVENTORIES_DIR, 'surreyvapes.json', all_products.flat())
}

module.exports = { scrapeProductPages, writeInventory }