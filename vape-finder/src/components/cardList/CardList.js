import './cardlist.css'
import Card from '../card/Card'

const products = [
    'Card1',
    'Card1',
    'Card1',
    'Card1',
    'Card1',
    'Card1',
    'Card1',
    'Card1',
]

function CardList() {
  return (
    <div className="card_container">  
        {products.map( (product)=> <Card product={product}/>)}     
    </div>
  );
}

export default CardList;