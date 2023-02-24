import './body.css'
import CardList from '.././cardList/CardList.js'
import LoadingOverlay from 'react-loading-overlay'

function Body( {query} ) {

  let { loading, error, data } = query

  console.log("data: ", data)
  console.log("loading: ", loading)

 // if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  //data ? data["getProducts"] : []

  const { fetchMore } = query

  return(
  <LoadingOverlay active={loading} spinner text=''>
    <main className="body">
      <CardList products={data ? data["getProducts"] : []} fetchMore={fetchMore} loading={loading}/>
    </main>
  </LoadingOverlay>
  );
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