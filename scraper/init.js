
/*
(async = () => {

    let tbv = false, sv = false, ezv = false

    function done(){      
        if(sv && tbv && ezv){
          require("./inventory").addInventoriesToDB()
        }
      }

      require("./scripts/ezvape").then( ()=>{
        ezv = true
        done()
      })
    
      require("./scripts/thunderbirdvapes").then( ()=>{
        tbv = true
        done()
      })
    
      require("./scripts/surreyvapes").then( ()=>{
        sv = true
        done()
      })
})()
*/

//require("./scripts/inventory")

/*
execute scraping scripts and write inventory json to db upon completion
- ezvape takes about 5 minutes to fully scrape
*/


Promise.all([
        require("./scripts/ezvape"), 
        require("./scripts/thunderbirdvapes"), 
        require("./scripts/surreyvapes")
    ]).then( () => {
        require("./scripts/inventory")
    }
)

