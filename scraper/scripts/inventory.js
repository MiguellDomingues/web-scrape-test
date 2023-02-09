const fs = require('fs');
const utils = require('../utils')

const createProducts = require('../../database/create/createProducts.js')

const LOG_FILE_NAME  = 'inventory'

const logger = utils.getLogger(LOG_FILE_NAME)

let vape_flavours = [
    'Arctic Jungle',
    'Black Cherry',
    'Tobacco',
    'Blue Cloud',
    'Blue Ice',
    'Blue Raspberry',
    'Blueberry',
    'Cherry Ice',
    'Vanilla Ice',
    'Custard',
    'Mint',
    'Fruit',
    'French Vanilla',
    'Grape',
    'Green Apple Grape',
    'Watermelon Strawberry Kiwi',
    'Cherry',
    'Goose Berry',
    'Honey Tobacco',
    'Grape',
    'Mango',
    'Menthol','Peach','Raspberry','Strawberry','Strawberry Coconut Pineapple','Watermelon','Peach']

function normalizeProducts(json, source){

    return json.map( (product) => {
        return {
            source:         source,
            source_id:      product.id,                 //TODO: can i hash a product id into a mongodb id?
            source_url:     `https://${source}.com`,    //TODO: each product needs a direct link to source product page
            last_updated:   '02/04/2023',
            product_info:{
                name:           product.name,               //TODO: 
                img_src:        product.img,                //TODO: need a process that fetches product images and saves them locally
                price:          product.price,              //TODO: remove the $ from some prices
                brand:          product.brand,              //TODO: for brandless products, most name fields contain the brand as the first letter
                category:       product.category            //TODO: split category strings from different vendors into discrete Tags for searching/filtering
            }
        }
    })
}


module.exports = ( () => {

    logger.info("***************** reading JSON files in " + utils.INVENTORIES_DIR+" ********************")

    const getFileName = file => file.split('.')[0]
    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR);

    if(inventories_dir.length < 1){
        logger.error(utils.INVENTORIES_DIR+ " has no files. aborting")
        return
    }

    logger.info("************ files: "+ inventories_dir.map(f => `${getFileName(f)}.json`).join(',') + "********************")

    const normalized_products = []

    const buckets = [
        {
            name: 'Juices',
            synonyms: ['e-juice', //surreyvapes
                       'ejuice',  //ezvape
                       'e-liquid'] //tbvapes
        },
        {
            name: 'Coils',
            synonyms: ['coil',]
        },
        {
            name: 'Pods',
            synonyms: ['pod',]
        },
        {
            name: 'Tanks',
            synonyms: ['tank', 'atomizer','clearomizer']
        },
        {
            name: 'Starter Kits',
            synonyms: ['starter', 'kit','disposable']
        },
        {
            name: 'Mods',
            synonyms: ['boxes', 'boxmod', 'box mod', 'mod', 'box']
        },
        {
            name: 'Batteries',
            synonyms: ['battery', 'batteries',]
        },
        {
            name: 'Chargers',
            synonyms: ['charger','charging']
        },
        {
            name: 'Replacement Glass',
            synonyms: ['glass',]
        },
        {
            name: 'Accessories/Miscellaneous',
            synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter']
        },

        
    ]

    const m = new Map()
    inventories_dir.forEach( (file)=>{
        //normalized_products.push(normalizeProducts(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger), getFileName(file)))
        //normalized_products.push(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger))

        const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger)
       // const m = new Map()

    
        function match_bucket_synonym(category_str, name_str){

            const bucket_points = {}

            const countMatches = (trgt, src) => {
                const result = trgt.match(new RegExp(src, 'g'))
                return result ? result.length : 0
            }
            
            for(idx in buckets){
                bucket_points[buckets[idx].name] = { points: 0}

                for(_idx in buckets[idx].synonyms){
                    bucket_points[buckets[idx].name].points = 
                        bucket_points[buckets[idx].name].points + countMatches(category_str, buckets[idx].synonyms[_idx])
                    bucket_points[buckets[idx].name].points = 
                        bucket_points[buckets[idx].name].points + countMatches(name_str, buckets[idx].synonyms[_idx])      
                }     
            }

            const a = {}

            let max = 0
            let max_bucket = undefined
//TODO: DEAL WITH TIE POINTS; PUT TIES IN ALL MATCHING BUCKETS
             Object.keys(bucket_points).forEach( (k)=>{
              if(bucket_points[k].points > max){
                  a[k] = bucket_points[k].points
                  max = bucket_points[k].points
                  max_bucket = k
             }})

             //console.log(max_bucket)

            return max_bucket
        }

        console.log("/////////////////////////////", getFileName(file), "///////////////////////////////////////")

        products.forEach( (p)=>{

            let str = p.category.toLowerCase()
            let str1 = p.name.toLowerCase()



            let match = match_bucket_synonym(str, str1)

           // console.log(str)
           // console.log(str1)
           // console.log(match)
           

            /*
            if(!match){
               // console.log('match the name instead: ', p.name.toLowerCase())
                match = match_bucket_synonym(p.name.toLowerCase())
               // console.log("match name result: ", match)
            }
            */

            
            if(match){
                let arr = []
                if(m.has(match)){
                    arr = m.get(match)
                    arr.push(p.name)
                    m.set(match, arr)
                }else{
                    arr.push(p.name)
                    m.set(match, arr)
                }
            }else{
                console.log(p.category, " ", p.name, "has no bucket")
            }   
            
            
            
        })
        
        //console.log(m)
        
    })

    console.log(m)

    /*
    createProducts(normalized_products.flat()).then((db_result)=>{
        logger.info("INSERTED " + db_result.length + " RECORDS")
    }).catch((err)=>{
        logger.error("err from database")
        logger.error(err)
    })  
    */ 

})()

/*

 const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger)
        const m = new Map()

        
        function match_bucket_synonym(str){

            for(idx in buckets){
                //console.log(buckets[idx])
                for(_idx in buckets[idx].synonyms){
                    //console.log(buckets[idx].synonyms[_idx])
                    if(str.includes(buckets[idx].synonyms[_idx])){
                        return buckets[idx].name                
                    }
                }     
            }

            return ""
        }

        

        console.log("/////////////////////////////", getFileName(file), "///////////////////////////////////////")

        products.forEach( (p)=>{

            let str = p.category.toLowerCase()

            let match = match_bucket_synonym(str)

          //  console.log(match)

            if(!match){
               // console.log('match the name instead: ', p.name.toLowerCase())
                match = match_bucket_synonym(p.name.toLowerCase())
               // console.log("match name result: ", match)
            }

            
            if(match){
                if(m.has(match)){
                    m.set(match, m.get(match)+1)
                }else{
                    m.set(match, 1)
                }
            }else{
                console.log(p.category, " ", p.name, "has no bucket")
            }   
            
            if(m.has(str)){
                m.set(str, m.get(str)+1)
            }else{
                m.set(str, 1)
            } 
        })
        console.log(m)
    })

*/




    const tags = [
        'aio',
        'open-pod',
        'closed-pod',
        'fruit',
        'grape',
        'ice',
        'menthol',
        'pod',
        'relx',
        'melon',
        'lychee',
        'passionfruit',
        'pineapple',
        'plum',
        'berries',
        'mango',
        'strawberry',
        'tobacco',
        'banana',
        'berry',
        'blackberry',
        'canadian',
        'tropical',
        'kiwi',
        'salt-nic',
        'honeydew',
        'black-currant',
        'currant',
        'disposable',
        'watermelon',
        'cantaloupe',
        'guava',
        'passion-fruit',
        'drinks',
        'lemon',
        'lemonade',
        'candy',
        'apple',
        'energy',
        'blueberry',
        'blue-raspberry',
        'raspberry',
        'sour',
        'mint',
        'citrus',
        'peach',
        'dragon-fruit',
        'cola',
        'root-beer',
        'vanilla',
        '2ml',
        'type-c',
        'sarsaparilla',
        'soda',
        'stlth',
        'stlth-x',
        'freebase',
        'lime',
        'cream',
        'orange',
        'mentol',
        'spearmint',
        'sync-pod',
        'grapefruit',
        'juicy',
        'stlth-pod',
        'dessert',
        'milk',
        'chocolate',
        'cookie',
        'eliquid',
        'cactus',
        'aloe',
        'blackcurrant',
        'xros-pod',
        'bloodorange',
        'cereal',
        'pomegranate',
        'vype',
        'iced',
        'creamy',
        'aspire',
        'pod-system',
        '18650',
        'sub-ohm',
        'novo',
        'pods',
        'reusable',
        'smok',
        'cinnamon',
        'custard',
        'nuts',
        'caramel',
        'doughnut',
        'peacan',
        'mesh',
        'kola',
        'kola-nut',
        'cherry',
        'chew',
        'gum',
        'coffee',
        'flavorless',
        'bold',
        'pine',
        'wintergreen',
        'sweet',
        'earthy',
        'zesty',
        'floral',
        'coils',
        'rpm3',
        'battery',
        'flat-top',
        'mocha',
        'earl-grey',
        'hazelnut',
        'tea',
        'breakfast',
        'yogurt',
        'cigar',
        'cuban',
        'pistachio',
        'beverage',
        'butterscotch',
        'punch',
        'replacement',
        'replacement-tank',
        'mtl',
        'nautilus',
        'falcon',
        'glass',
        'tank',
        'papaya',
        'g2-pod',
        'koko',
        'cisoo',
        'herbs',
        'rose',
        'tapioca',
        'peppermint',
        'cocoa',
        'cranberry',
        'juul',
        '22q1',
        'nord',
        'melonwatermelon',
        'gummy',
        'jasmin',
        'taro',
        'tart',
        'drink',
        'nord-coil',
        'tpp',
        'gene-chip',
        'flexus',
        'almond',
        'flavourless',
        'plain',
        'charry',
        'kanthal',
        'mech',
        'vtc',
        'yuzy',
        'local',
        'cake',
        'cinamon',
        'fried',
        'savory',
        'pecan',
        'sat-nic',
        'geekvape',
        'charger',
        'lp2',
        'marshmallow',
        'cotton-candy',
        'maple',
        'dr-fog',
        'e-liquid',
        'earl-gray',
        'london-fog',
        'ultra-fog',
        'creamy-yogurt',
        'loch-ness',
        'peaches-and-cream',
        'creme-brulee',
        'da-vinci',
        'pecans',
        'big-foot',
        'mini-donuts',
        'root-beer-float',
        'anise',
        'licorice',
        'cucumber',
        'watermelon-ice',
        'uwell',
        'butter',
        'sugar',
        'low-mint',
        'red-bull',
        'fuji',
        'coconut',
        'ipx80',
        'rpm',
        'pineapple-ice',
        'koolada',
        'starter-kit',
        'pod-kit',
        'atlantis-coil',
        'coil',
        'blue',
        '12-monkeys',
        'circle-of-life',
        'ludou',
        'crown',
        'mixed-berry',
        'dragonfruit',
        'wick',
        'creamo',
        'pear',
        'pipe',
        'raisin',
        'rum',
        'external-battery',
        'fireluke-coil',
        'nfix',
        'aegis',
        'taifun',
        'ultem',
        'baby-beast',
        'nrg',
        'apricot',
        'pyrex',
        'rebuildable',
        'rta',
        'glass-section',
        'metal-cover',
        'clear',
        'bubble',
        'subohm',
        'davinci',
        'lithiumion',
        'miqro',
        'rechargeable',
        'replacement-glass',
        'cascade',
        'alcohol',
        'vaporesso',
        'box-mod',
        'notch',
        'single-coil',
        'stainless-steel',
        'low-profile',
        'squonk',
        'jelly',
        'cherry-blossom',
        'japanese',
        'ice-cream',
        'green-tea',
        'pink',
        'orion',
        'slatnic',
        'case',
        'portable',
        'cable',
        'usb',
        'dual',
        'mini-tank',
        'dna',
        'nut',
        'internal-battery',
        'troical',
        'pina-colada',
        'canteloup',
        'organic',
        'stone-fruit',
        'jack-fruit',
        'Box Mod',
        'wide-bore',
        'dl',
        'widebore',
        'cloud-beast-king',
        'Squonk',
        'spare-parts']
