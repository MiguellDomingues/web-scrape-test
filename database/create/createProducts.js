const { Product } = require('../models.js');
let db = require('../database.js')

module.exports = async function createProducts(products) {
    return new Promise( (resolve, reject) => {
         db.connect().then( ()=>{
            Product.insertMany(products)
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
            .finally( ()=> { db.disconnect()} )
    
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

