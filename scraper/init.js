
/*
execute scraping scripts and write inventory json to db upon completion
- ezvape takes about 10 minutes to fully scrape
TODO: how to change vpn servers from nord cli inbetween requests?
TODO   use puppeteer instead to leverage chrome browser features (cache pages, loaded images)
- less sent requests
- fetch and save thumbnail images to disk when scraping a link
*/

Promise.all([
        require("./scripts/ezvape"), 
        require("./scripts/thunderbirdvapes"), 
        require("./scripts/surreyvapes")
    ]).then( () => {
        require("./scripts/inventory")
    }
)

