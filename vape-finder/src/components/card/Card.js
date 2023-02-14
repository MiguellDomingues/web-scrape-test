import './card.css'

//can also link images using import or require() 
//import demoImage from './demo.webp'; 

const img_src = '../../../demo.webp';

function Card( {product} ) {
  //const {id, name, brand, category, img, price, last_updated, source} = product

  const {id, last_updated, source_id, source_url, info } = product
  const{ brand, category, name, price, info_url,  } = info

  const vendor = source_url.split("//")[1].split(".")[0]
  const format_price = price.toFixed(2);

  let format_name = name.toLowerCase().replace( brand ? brand.toLowerCase() : '', '').trim()
  format_name = format_name.replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/ig, '') //remove all start/end nonalphanumeric chars

  //if(format_name.includes(' - ')) format_name = format_name.replace(' - ', ' ').trim()

  //rel="noopener noreferrer" is to prevent 'tabnabbing', a kind of phishing attack
 
  return (
    <div className="card">
      
      <a href={info_url} target="_blank" rel="noopener noreferrer">{vendor}<br/></a>
      {brand && <><span>{brand}<br/></span></> }    
      <span className="title">{format_name}<br/></span>   
      <span>${format_price}<br/></span>

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


