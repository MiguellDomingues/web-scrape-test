
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Body from './components/body/Body'
import { useQuery } from '@apollo/client' 

import { GET_PRODUCTS } from './queries/queries.js'

import './app.css'

function App() {

  //let query = useQuery(GET_INIT);

  const query = useQuery(GET_PRODUCTS, { variables: { category: "", stores: [], brands: [] } });

  const { data, loading, error } = query

  console.log(data)

  const refetch = (c,b,s) => {
    console.log(c,b,s)
    query.refetch({ category: c, brands: b, stores: s } )
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
