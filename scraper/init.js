
/*
execute scraping scripts and write inventory json to db upon completion
- ezvape takes about 5 minutes to fully scrape
*/

Promise.all([
      //require("./scripts/ezvape"), 
      //require("./scripts/thunderbirdvapes"), 
      //require("./scripts/surreyvapes")
    ]).then( () => {
      require("./scripts/inventory")
    })

