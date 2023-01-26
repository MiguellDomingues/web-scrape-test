const fs = require("fs");
const axios = require("axios");

const ROOT_DATA_DIR     = 'raw_pages'
const INVENTORIES_DIR   = 'inventories'
const LOGS_DIR          = 'logs'

if (!fs.existsSync(ROOT_DATA_DIR)) fs.mkdirSync(ROOT_DATA_DIR, { recursive: true });  
if (!fs.existsSync(INVENTORIES_DIR))fs.mkdirSync(INVENTORIES_DIR, { recursive: true });  
if (!fs.existsSync(LOGS_DIR))fs.mkdirSync(LOGS_DIR , { recursive: true });  

function writeJSON(dir, file_name, json, logger = undefined){
    const path = dir + `/` + file_name
    fs.writeFileSync(path, JSON.stringify(json, null, 2) );
    !logger ? console.log("wrote ", json.length, " items into ", path) : logger.writeln("wrote "+ json.length+ " items into "+ path)
}


function readJSON(dir, file_name, logger = undefined){
    const path = dir + `/` + file_name
    const json = JSON.parse(fs.readFileSync(dir + '/' + file_name, {encoding:'utf8', flag:'r'}))
    !logger ? console.log("read ", json.length, " items from ", path) : logger.writeln("read "+ json.length+ " items from "+ path)
    return json
}

function Logger(file_name){
    //return an IIFE to ensure a unique write stream when Logger is called
    return (function () {
        const logger = fs.createWriteStream(`${LOGS_DIR}/${file_name}`)

        return {
            writeln : (str) => logger.write(`${str}\n`),
            write : (str) => logger.write(`${str}`),
            end   : _=>logger.end()  
        }
    })();
}

async function scrapePages(urls, scraper, logger){
    return new Promise( async (resolve, reject) => {
        try{               
                const time_start = Date.now()
                const scraped_pages = []

                for (const url of urls){
                    try{
                        const { data } = await axios.get(url)
                        const scraped_json = scraper(data)

                        if(scraped_json.length === 0) 
                            break

                        if(scraped_json.length) 
                            logger.writeln("scraped "+ scraped_json.length + " items from "+ url)
                        else if(Object.keys(scraped_json).length)
                            logger.writeln("scraped "+ Object.keys(scraped_json).length + " keys from "+ url)
                        
                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, 2500)))()
                    }catch(err){
                        logger.writeln("error scraping "+ url)
                        console.error(err)
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

module.exports = { writeJSON, readJSON, ROOT_DATA_DIR, INVENTORIES_DIR, Logger, scrapePages}