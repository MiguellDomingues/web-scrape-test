const express             = require('express');
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");
const url = require('url');   

var app                   = express();
PORT = 8080


/*
app.listen(PORT, () => {
    console.log("server running")
});

app.get( '/', (req, res) => {
    
    res.send('success')
})
*/

  /*

async function b(){

    const { data } = await axios.get('https://www.thunderbirdvapes.com/collections/all-e-liquids?page=2');

    json_str = data.match(/var meta = (\{.*\})/)[1]
  let data1 = JSON.parse(json_str)

    //console.log(data)

    let variant_count = 0
    let product_count = 0

    data1["products"].forEach( (product) => {
         
        product.variants && product.variants.forEach( (variant) => { 
            variant_count++
            //console.log("variant: ", variant)
        } ) 

        product_count++
        
    })

    console.log("pc:", product_count)
    console.log("vc:", variant_count)

  }
  
 */

 
 // console.log(new Date().toISOString().split('.')[0]); // 9/17/2016
 // console.log( isValidUrl('ww/fdegrtgrfdg//,com') )

/*
async function testing(){

  let tbv = false, sv = false


  function done(){
    console.log(tbv, " ", sv)
    if(sv && tbv){
      console.log("all done")
    }
  }


  thunderbirdvapes.execute().then( ()=>{
    tbv = true
    done()
  })


  surreyvapes.execute().then( ()=>{
    sv = true
    done()
  })
  // ezvape.execute()
  //inventory.addInventoriesToDB()


}

testing()




 function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

async function f1 (){
  const { exec } = require("child_process");
  exec("node test.js", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
  });

}

async function f2 (){
  const { spawn } = require("child_process");

const ls = spawn("ls", ["-la"], {shell: true});

ls.stderr.on("data", data => {
  console.log(`stderr: ${data}`);
});

ls.on('error', (error) => {
  console.log(`error: ${error.message}`);
});

ls.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
}


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1,1,1].map(_ => 1 + Math.floor(Math.random() * 6));
  },
  rollDice: (args) => {
    var output = [];
    for (var i = 0; i < args.numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
    }
    return output;
  }
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
 
*/


 




 





    

 

  

