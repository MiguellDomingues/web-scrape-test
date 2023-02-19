
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Body from './components/body/Body'
import { useQuery } from '@apollo/client' 
import {useState} from 'react'

import { GET_PRODUCTS } from './queries/queries.js'

import './app.css'

const starting_filters = { category: "", brands: [], stores: [] }

function App( { client }) {

  console.log("/////// APP RERENDER ///////")

  const [selected_filters, setFilters] = useState(starting_filters);
 
  const query = useQuery(GET_PRODUCTS, { variables: { last_product_id: "", ...starting_filters } }, {
    fetchPolicy: 'cache-first', 
    nextFetchPolicy: 'cache-first', 
  });

  const setAndRefetch = (selected_filters = starting_filters) => {
    setFilters(selected_filters) 
    document.getElementById('cardContainer').scroll({top:0});

/*
    const cache2 = client.readQuery({
      query: GET_PRODUCTS ,
      variables: {...selected_filters},
    });
    */

   // cache2 ? setCache(cache2) : 
   query.refetch({...selected_filters}) 

    //query.refetch({...selected_filters}) 
}

const echo = () => console.log("////APP: ", selected_filters)

echo()

  const selected_filters_handlers = {
    selected_filters,
    setAndRefetch,
  }

  

  return (
    <div className="page"> 
      <div className="app">     
        <Header refetch={selected_filters_handlers}/>
        <Body query={query}/> 
        <Footer refetch={selected_filters_handlers}/>
      </div>
    </div>
  );
}

export default App;

