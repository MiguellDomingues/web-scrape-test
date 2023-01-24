const fs = require("fs");

const ROOT_DATA_DIR     = 'raw_pages'
const INVENTORIES_DIR   = 'inventories'
const LOGS_DIR          = 'logs'

function writeJSON(dir, file_name, json, logger = undefined){
    const path = dir + `/` + file_name
    fs.writeFileSync(path, JSON.stringify(json, null, 2) );
    !logger ? console.log("wrote ", json.length, " items into ", path) : logger.write("wrote "+ json.length+ " items into "+ path)
}


function readJSON(dir, file_name, logger = undefined){
    const path = dir + `/` + file_name
    const json = JSON.parse(fs.readFileSync(dir + '/' + file_name, {encoding:'utf8', flag:'r'}))
    !logger ? console.log("read ", json.length, " items from ", path) : logger.write("read "+ json.length+ " items from "+ path)
    return json
}

function Logger(file_name){

    const logger = fs.createWriteStream(`${LOGS_DIR}/${file_name}`)
  
    return {
      write : (str) => logger.write(`${str}\n`),
      end   : _=>logger.end()  
    }
}

module.exports = { writeJSON, readJSON, ROOT_DATA_DIR, INVENTORIES_DIR, Logger }