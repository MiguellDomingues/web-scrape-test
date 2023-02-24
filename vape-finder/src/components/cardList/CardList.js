import './cardlist.css'
import Card from '../card/Card'
import {useState} from 'react'

function CardList( { products, fetchMore, loading } ) {

 
  const [last_product_id, setLPID] = useState("");

  const PRODUCTS_PER_PAGE = 11

  const hasProducts = p => p?.length > 0
  const isBottom = e => e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
  
  const handleBottom = () =>{

    const lpid = products[products.length-1].id
    console.log("last_product_id calc: ", last_product_id, " lpid: ", lpid)

    if(products.length%PRODUCTS_PER_PAGE === 0 && last_product_id !== lpid){
      setLPID(lpid)
      console.log("fetch Page")
      fetchMore({ variables: { last_product_id: lpid},})
    }
  }

  return (
    <div className="card_container" id="cardContainer" onScroll={ e => isBottom(e) && hasProducts(products) && handleBottom() }>  
        {!loading && 
          <select className='dropdown'>
            <option value="none">None</option>
            <option value="high_to_low">Price: High to Low</option>
            <option value="low_to_high">Price: Low to High</option>
          </select>
        }
        {products.map( (product, idx)=> 
          <Card key={idx} product={product}/>)}     
    </div>
  );
}

export default CardList
