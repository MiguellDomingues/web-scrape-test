import './body.css'
import CardList from '.././cardList/CardList.js'
import LoadingOverlay from 'react-loading-overlay'

function Body( {query} ) {

  let { loading, error, data } = query

  console.log("data: ", data)
  console.log("loading: ", loading)

  if (error) return `Error! ${error.message}`;

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

