
import Footer from './components/footer/Footer'
import Header from './components/header/Header'
import Body from './components/body/Body'

import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from './queries/getProducts.js'

import './app.css'

function App() {

  const tags = []

  const query = useQuery(GET_PRODUCTS, { variables: { tags } });

  const onTagSelected = (tag) => { 
    console.log(tag)
    tags.push(tag)
    
    query.refetch({ tags: tags  })

  }
  
  return (
    <div className="page"> 
      <div className="app">
        <Header selected={onTagSelected}/>
        <Body query={query}/>
        <Footer/>
      </div>
    </div>
  );
}

export default App;
