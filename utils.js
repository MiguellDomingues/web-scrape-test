const fs = require("fs");

const ROOT_DATA_DIR     = 'raw_pages'
const INVENTORIES_DIR   = 'inventories'

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

module.exports = { writeJSON, readJSON, ROOT_DATA_DIR, INVENTORIES_DIR }