
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Body from './components/body/Body'
import { useQuery, useApolloClient } from '@apollo/client' 
import {useState} from 'react'

import { GET_PRODUCTS } from './queries/queries.js'

import './app.css'

const starting_filters = { category: "", brands: [], stores: [] }

function App() {

  console.log("/////// APP RERENDER ///////")

  const [selected_filters, setFilters] = useState(starting_filters);
  const client = useApolloClient()
 
  const query = useQuery(GET_PRODUCTS, { variables: { last_product_id: "", ...starting_filters }, 
    notifyOnNetworkStatusChange: true, }, 
  {
    fetchPolicy: 'cache-first', 
    nextFetchPolicy: 'cache-first', 
  });

  
  const setAndRefetch = (selected_filters = starting_filters) => {
    setFilters(selected_filters) 
    document.getElementById('cardContainer').scroll({top:0});
/*
    result = client.refetchQueries({
      include: [GET_PRODUCTS],
      updateCache(cache) {
        console.log("update cache()")
      },
    
      onQueryUpdated(observableQuery, diff, lastDiff) {
        // Logging and/or debugger breakpoints can be useful in development to
        // understand what client.refetchQueries is doing.
        console.log(`Examining ObservableQuery `, observableQuery);
        console.log(`diff `, diff);
        console.log(`lastDiff `, lastDiff);

        const cache2 = client.readQuery({
      query: GET_PRODUCTS ,
      variables: {...selected_filters},
       });

        console.log("CACHE QUERY: ", cache2)
        
    
        // Proceed with the default refetching behavior, as if onQueryUpdated
        // was not provided.
        return true;
      },
    })
    */
    query.refetch({...selected_filters}) 
}

console.log("////APP: ", selected_filters)

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

