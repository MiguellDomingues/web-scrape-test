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

// like a class...
function getMap(_logger){
    
    //like an instance of the class
    return (function (_logger){
        // the public variables
        const m = new Map()
        const logger = _logger

        return {
            put: function (k,v) {
                const arr = m.has(k) ? m.get(k) : []
                arr.push(v)
                m.set(k, arr) },
            print: function (){ 
                let sorted = []
                m.forEach( (v,k) => sorted.push(k) );
                sorted.sort().forEach( k => logger.info( k + " : " + m.get(k).length))},
            merge: function (src){
                for (const k of src.keys()) {
                    if(m.has(k)){
                        //
                        m.get(k).push(...src.get(k))
                        //m.set(k, arr)
                    }else{
                        m.set(k, [...src.get(k)] )
                    }
                }
            },
            getMap: m
        }
    })(_logger)
}

function getProductBuckets(category_str, name_str, buckets){

    /*
    calculate the bucket points for each bucket by scanning the product category/name strs for keywords
    return an object of the form { "bucketname1":{points: int}, "bucketname2":{points: int}, ... }
    */
    const bucket_points = ( (category_str, name_str) =>{
        category_str = category_str.toLowerCase()
        name_str = name_str.toLowerCase()

        //count the occurances of src string inside the trgt string
        const countMatches = (trgt, src) => {
            const result = trgt.match(new RegExp(src, 'g'))
            return result ? result.length : 0
        }

        /*
        const countPositionalMatches = (trgt, src)=>{
        let position_points = 0
        trgt.split(',').forEach( (word, idx )=> position_points = position_points + word.includes(src) ? ++idx : 0)
        return position_points
      }
        */

        const bucket_points = {}

        buckets.forEach( (bucket)=>{
            bucket_points[bucket.name] = { points: 0}
            bucket.synonyms.forEach( (synonym)=>{
                synonym = synonym.toLowerCase()
                let points = bucket_points[bucket.name].points
                points = points + countMatches(category_str, synonym) + countMatches(name_str, synonym)
                bucket_points[bucket.name].points = points
            })
        })

        return bucket_points
    })(category_str, name_str)

    /*
    return 0-n max score bucket name(s)
    if multiple buckets were tied for max score, return those bucket names
    if all the scores were 0, returns an empty list     
    */
    const max_points_buckets = ( (bp)=>{
        const non_zero_points = Object.keys(bp).filter( k => bp[k].points > 0)                                                
        const sorted_by_max_points = non_zero_points.sort( (lhs, rhs)=> bp[rhs].points - bp[lhs].points)
        const max_points_bucket = sorted_by_max_points.shift()
        return max_points_bucket ? [max_points_bucket, ...sorted_by_max_points.filter( k => bp[k].points === bp[max_points_bucket].points )] : []
    })(bucket_points)

    return max_points_buckets
}

//TODO: the scraper function should return a object of just key->arr's, instead of an arr OR an object of key->arrs
async function scrapePages(urls, scraper, logger, limit = 300){
    return new Promise( async (resolve, reject) => {
        try{               
                const time_start = Date.now()
                const scraped_pages = []
                let page_count = 0

                for (const url of urls){
                    try{
                        const { data } = await axios.get(url)
                        const scraped_json = scraper(data)

                        if(scraped_json.length === 0){
                            logger.info(`scrape on ${url} failed to return any data. aborting` )
                            break
                        }
                         
                        if(scraped_json.length) 
                            logger.info("scraped "+ scraped_json.length + " items from "+ url)
                        else if(Object.keys(scraped_json).length)
                            logger.info("scraped "+ Object.keys(scraped_json).length + " keys from "+ url)
                                          
                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, REQUEST_TIME_OUT)))()
                
                        if(++page_count === limit){
                            logger.info(`limit of ${limit} callouts reached. aborting` )
                            break
                        }

                    }catch(err){
                        logger.info(err + "error scraping "+ url)
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

module.exports = { writeJSON, readJSON, getLogger, scrapePages, createDirs, getMap, getProductBuckets, ROOT_DATA_DIR, INVENTORIES_DIR }