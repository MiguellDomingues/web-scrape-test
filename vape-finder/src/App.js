
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Body from './components/body/Body'
import { useQuery } from '@apollo/client' 

import { GET_PRODUCTS } from './queries/queries.js'

import './app.css'

function App() {

  const query = useQuery(GET_PRODUCTS, { variables: { last_product_id: "", category: "", stores: [], brands: [] } }, {
    fetchPolicy: 'network-only', 
    nextFetchPolicy: 'cache-first', 
  });

  const refetch = (selected_filters) => {
    //console.log(selected_filters)
    document.getElementById('cardContainer').scroll({top:0});
    query.refetch({...selected_filters})
  }

  return (
    <div className="page"> 
      <div className="app">     
        <Header refetch={refetch}/>
        <Body query={query}/> 
        <Footer/>
      </div>
    </div>
  );
}

export default App;

