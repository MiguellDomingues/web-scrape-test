import './body.css'
import CardList from '.././cardList/CardList.js'
import { useQuery } from '@apollo/client';

import { GET_PRODUCTS } from '../../queries/getProducts.js'

function Body() {

  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (<main className="body">
    <CardList products={data["getProducts"]} />
  </main>);
}

export default Body;