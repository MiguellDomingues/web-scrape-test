
/*
execute scraping scripts and write inventory json to db upon completion
- ezvape takes about 5 minutes to fully scrape
*/


const tbvapes_config = {
   domain:              'https://www.thunderbirdvapes.com',
   data_dir:            'thunderbirdvapes',
   raw_products_file:   'products',
   inventory_file:      'thunderbirdvapes',
   log_file:            'thunderbirdvapes',
   buckets:[
      {
          name: 'Juices',
          synonyms: ['E-Liquid'] 
      },
      {
          name: 'Coils',
          synonyms: ['coil','rda','atomizer','RPM 40 Pod','Ego 1 Coil 1.0 Ohm 5/Pk','Metal RDA Stand','Crown 5 Coil']
      },
      {
          name: 'Pods',
          synonyms: ['pod',]
      },
      {
          name: 'Tanks',
          synonyms: ['tank','clearomizer']
      },
      {
          name: 'Starter Kits',
          synonyms: ['starter', 'kit','disposable','disposables']
      },
      {
          name: 'Mods',
          synonyms: ['boxes', 'boxmod', 'box mod', 'mod', 'box', 'Aegis Legend 2 200W Mod']
      },
      {
          name: 'Batteries',
          synonyms: ['battery', 'batteries','18650','18650','Evod 650mAh Battery']
      },
      {
          name: 'Chargers',
          synonyms: ['charger','charging','lush q4 charger','evod usb charger','Intellicharger I4 V2 Li-Ion/Nimh','Battery Charger','Wall Adapter','Power Bank']
      },
      {
          name: 'Replacement Glass',
          synonyms: ['glass','replacement','pyrex','replacement glass','dotAIO V2 Replacement Tank']
      },
      {
          name: 'Accessories/Miscellaneous',
          synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter',
          'screwdriver','tweezer','decorative ring','magnet connector','vaper twizer','diy tool kit','Clapton Coil Building Kit','Zipper Storage Bag','Mouthpiece Glass']
      }
    ],
    utils:                      require("./utils.js"),
    execute_scrape:             false,
    execute_inventory:          true
}



Promise.all([
      //require("./scripts/ezvape"), 
      require("./scripts/thunderbirdvapes")(tbvapes_config)
     // require("./scripts/surreyvapes")
    ]).then( () => {
     // require("./scripts/inventory")
    })




    

     


