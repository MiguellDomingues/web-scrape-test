import './card.css'

//can also link images using import or require() 
//import demoImage from './demo.webp'; 

const img_src = '../../../demo.webp';

function Card( {product} ) {
  //const {id, name, brand, category, img, price, last_updated, source} = product

  const {id, last_updated, source_id, source_url, info } = product
  const{ brand, category, name, price } = info


 
  return (
    <div className="card">

      <span>{source_url}<br/></span>
      <span>{brand}<br/></span>
      <span>{category}<br/></span>
      
      <span className="title">{name}<br/></span>   
      <span>${price}<br/></span>

      <img className="product_img"
        src={img_src}
        alt="Product">
      </img>

      <div className="card_footer">
        <span>last updated: {last_updated}</span>
      </div>
      
    </div>
  );
}

export default Card;

/*
id "63def6359b25698ec550117a"
last_updated "02/04/2023"
source_id "1370"
source_url "https://surreyvapes.com"

info
brand ""
category "PRODUCTS/E-Cigs/ReplacementPods"
img_src "https://cdn11.bigcommerce.com/s-f8le7jshax/images/stencil/300x300/products/1370/1693/Screen-Shot-2022-10-06-at-6-06-21-PM__10432.1667502935.png?c=1"
name "Caliburn A2S Pods"
price  "7.95"
*/


