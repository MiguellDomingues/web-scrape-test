const { Product, TagMetaData } = require('../models.js');
let db = require('../database.js')

async function fetchProducts() {   
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

 async function fetchProductsByCategoryBrandStore( query_str ) {   
    return new Promise( (resolve, reject) => {
        db.connect().then( ()=>{
            Product.find(query_str)
                .then( (products) => { resolve(products)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

 async function fetchTagMetaData() {   
    return new Promise( (resolve, reject) => {
        db.connect().then( ()=>{
            TagMetaData.
            aggregate([ { $project: { __v: 0} } ])
                .then( (tmd) => { resolve(tmd)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }



 module.exports = { fetchProducts, fetchProductsByCategoryBrandStore, fetchTagMetaData }

