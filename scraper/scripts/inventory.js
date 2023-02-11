const fs = require('fs');
const utils = require('../utils')

const createProducts = require('../../database/create/createProducts.js')

const LOG_FILE_NAME  = 'inventory'

const logger = utils.getLogger(LOG_FILE_NAME)

const buckets = [
    {
        name: 'Juices',
        synonyms: ['e-juice', //surreyvapes
                   'ejuice',  //ezvape
                   'e-liquid'] //tbvapes
    },
    {
        name: 'Coils',
        synonyms: ['coil','rda','atomizer']
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
        synonyms: ['glass','replacement','pyrex','replacement glass']
    },
    {
        name: 'Accessories/Miscellaneous',
        synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter','screwdriver','tweezer','decorative ring','magnet connector','vaper twizer']
    },      
]

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

function normalize(product, categories, source){

        return {
            source:         source,
            source_id:      product.id,                 //TODO: can i hash a product id into a mongodb id?
            source_url:     `https://${source}.com`,    //TODO: each product needs a direct link to source product page
            last_updated:   '02/04/2023',
            categories:     [...categories],
            product_info:{
                name:               product.name,      
                info_url:           product.src,         
                img_src:            product.img,                //TODO: need a process that fetches product images and saves them locally
                price:              product.price,              
                brand:              product.brand,              
                category_str:       product.category           
            }
        }  
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

    

    const merged_maps = utils.getMap(logger)
    let total_products = 0

    inventories_dir.forEach( (file)=>{
        //normalized_products.push(normalizeProducts(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger), getFileName(file)))
        //normalized_products.push(utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger))

        const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), logger)
        total_products+=products.length
       

        //return the matching bucket names, if any, for a product
        function getProductBuckets(category_str, name_str){

            /*
            calculate the bucket points for each bucket by scanning the product category/name strs for keywords
            return an object of the form { "bucketname1":{points: int}, "bucketname2":{points: int}, ... }
            */
            const bucket_points = ( (category_str, name_str) =>{

                //count the occurances of src string inside the trgt string string
                const countMatches = (trgt, src) => {
                    const result = trgt.match(new RegExp(src, 'g'))
                    return result ? result.length : 0
                }

                const bucket_points = {}

                buckets.forEach( (bucket)=>{
                    bucket_points[bucket.name] = { points: 0}
                    bucket.synonyms.forEach( (synonym)=>{
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

        logger.info("/////////////////////////////"+ getFileName(file)+ "///////////////////////////////////////")

        const map = utils.getMap(logger)
        let tie_matches_count = 0

        products.forEach( (p)=>{

            let matches = getProductBuckets(p.category.toLowerCase(), p.name.toLowerCase())

            if(matches.length === 0){        
                logger.info(p.category+ " "+ p.name+ "has no bucket")
            }else if(matches.length > 1){
                logger.info("multiple matches: ("+ matches + ") " + p.category+ " | "+ p.name) //if there was a tie among buckets, add the same product to multiple buckets
                map.put(matches[0],p)
                merged_maps.put(matches[0],p)
                tie_matches_count++
            }else{
                map.put(matches[0],p)
                merged_maps.put(matches[0],p)
            } 

            normalized_products.push(normalize(p, [matches[0]], getFileName(file)))
        })
        logger.info("/////////////////////////////BUCKETS///////////////////////////////////////")
        map.print()
       
    })

    logger.info("/////////////////////////////BUCKETS FOR ALL PRODUCTS///////////////////////////////////////")

    merged_maps.print()

    //console.log(normalized_products)
    //console.log(normalized_products.length)
    
    createProducts(normalized_products).then((db_result)=>{
        logger.info("INSERTED " + db_result.length + " RECORDS")
    }).catch((err)=>{
        logger.error("err from database")
        logger.error(err)
    })  
    

})()

/*

 /*
            
            for(idx in buckets){
                bucket_points[buckets[idx].name] = { points: 0}

                for(_idx in buckets[idx].synonyms){
                    bucket_points[buckets[idx].name].points = 
                        bucket_points[buckets[idx].name].points + countMatches(category_str, buckets[idx].synonyms[_idx])
                    bucket_points[buckets[idx].name].points = 
                        bucket_points[buckets[idx].name].points + countMatches(name_str, buckets[idx].synonyms[_idx])      
                }     
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
