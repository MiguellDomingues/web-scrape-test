import './body.css'
import CardList from '.././cardList/CardList.js'

function Body( {query} ) {

  const { loading, error, data } = query

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  const { fetchMore } = query

  return (<main className="body">
    <CardList products={data["getProducts"]} fetchMore={fetchMore}/>
  </main>);
}

export default Body;

/*
import './body.css'
import CardList from '.././cardList/CardList.js'

function Body( {query} ) {

  const { loading, error, data } = query

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (<main className="body">
    <CardList products={data["getProducts"]} />
  </main>);
}

export default Body;
*/