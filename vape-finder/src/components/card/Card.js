import './card.css'

//can also link images using import or require() 
//import demoImage from './demo.webp'; 

function Card( {product} ) {
  const {id, name, brand, category, img, price, last_updated, source} = product
 
  return (
    <div className="card">

      <span>{source}<br/></span>
      <span>{brand}<br/></span>
      <span>{category}<br/></span>
      
      <span className="title">{name}<br/></span>   
      <span>${price}<br/></span>

      <img class="product_img"
        src={img}
        alt="Grapefruit slice atop a pile of other slices">
      </img>

      <div className="card_footer">
        <span>last updated: {last_updated}</span>
      </div>
      
    </div>
  );
}

export default Card;

