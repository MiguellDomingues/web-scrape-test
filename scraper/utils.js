const fs = require("fs");
const axios = require("axios");

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const ROOT              = 'scraper'
const ROOT_DATA_DIR     = `${ROOT}/raw_pages`
const INVENTORIES_DIR   = `${ROOT}/inventories`
const LOGS_DIR          = `${ROOT}/logs`

const REQUEST_TIME_OUT   = 2500 //time in ms between requests

createDirs([ROOT_DATA_DIR, INVENTORIES_DIR, LOGS_DIR])

function createDirs(dirs){
    dirs.forEach( dir => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true }) )
}

function writeJSON(dir, file_name, json, logger){
    //TODO check for empty json
    const path = `${dir}/${file_name}.json`
    fs.writeFileSync(path, JSON.stringify(json, null, 2) );

    if(!json.length && Object.keys(json).length){ // if json is an object of string keys and array values:
        let items = 0
        Object.keys(json).forEach( key => items = items + json[key].length )
        logger.info("read " + Object.keys(json).length + " keys with "+ items +" items from " + file_name )
    }else if(json.length && Object.keys(json).length){  //if json is an array
        logger.info("wrote " + json.length + " items into " + path);
    }else{
        logger.info("error writing json items into " + path);
    }

}

function readJSON(dir, file_name, logger){
    const path = `${dir}/${file_name}.json`
    const json = JSON.parse(fs.readFileSync(path, {encoding:'utf8', flag:'r'}))
    if(!json.length && Object.keys(json).length){
        let items = 0
        Object.keys(json).forEach( key => items = items + json[key].length )
        logger.info("read " + Object.keys(json).length + " keys with "+ items +" items from " + file_name )
    }else if(json.length && Object.keys(json).length){
        logger.info("read "+ json.length+ " items from "+ path);
    }else{
        logger.info("error reading json items from " +file_name);
    }

    return json
}

function getLogger(log_file_name){

    const myFormat = printf(({ message, timestamp }) => {
        return `${timestamp} ${message}`;
    });

    return (function (){
        return createLogger({
            format: combine(
              timestamp(),
              myFormat
            ),
            transports: 
            [
                new transports.Console(),
                new transports.File({ filename: `${LOGS_DIR}/${log_file_name}.log`,}),
            ]
        });
    })()
}

//TODO: the scraper function should return a object of just key->arr's, instead of an arr OR an object of key->arrs
// 
async function scrapePages(urls, scraper, logger){
    return new Promise( async (resolve, reject) => {
        try{               
                const time_start = Date.now()
                const scraped_pages = []

                for (const url of urls){ //loop will exit if url 404's, scraper function returns empty obj, or on any exception
                    try{
                        const { data } = await axios.get(url) 
                        const scraped_json = scraper(data)

                        if(scraped_json.length === 0) 
                            break 

                        if(scraped_json.length) 
                            logger.info("scraped "+ scraped_json.length + " items from "+ url)
                        else if(Object.keys(scraped_json).length)
                            logger.info("scraped "+ Object.keys(scraped_json).length + " keys from "+ url)
                                          
                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, REQUEST_TIME_OUT)))()
                    }catch(err){
                        logger.info("error scraping "+ url) 
                        break 
                    }           
                }
      
                const time_finish = Date.now()
                logger.info("completed scrape in " + (time_finish - time_start)/1000 + " seconds")
                logger.info("pages: " + scraped_pages.length + "/" + urls.length)
                resolve(scraped_pages)

        }catch(err){
            reject(err)
        }
    })
}

module.exports = { writeJSON, readJSON, getLogger, scrapePages, createDirs, ROOT_DATA_DIR, INVENTORIES_DIR }