const { Product } = require('../models.js');
let db = require('../database.js')

module.exports = async function fetchProducts() {   

    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{
            Product.
            aggregate([ { $sample: { size: 10 } }, { $project: { __v: 0} } ])
                .then( (products) => { resolve(products)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

