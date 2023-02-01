import './cardlist.css'
import Card from '../card/Card'

// link images from relative path to /public folder
// card/components/src/ (image name)
const img_src = '../../../demo.webp';

const products = [
  {
    "last_updated":"01/02/2023",
    "source": "EZVape", 
    "id": "1668",
    "name": "ELF Bar BC1000",
    "category": "PRODUCTS/E-Cigs/DisposableVapes",
    "price": "19.95",
    "brand": "ELF Bar",
    "img": img_src
  },
  
  {
    "last_updated":"01/02/2023",
    "source": "EZVape",
    "id": 8211076251888,
    "name": "RELX Pro 1.9ml Pods - Lychee Ice",
    "brand": "RELX",
    "category": "Parts - Pods - Closed System",
    "img": img_src,
    "price": "15.99"
  },
  {
    "last_updated":"01/02/2023",
    "source": "EZVape",
    "id": 8211075793136,
    "name": "RELX Pro 1.9ml Pods - Pineapple Passionfruit",
    "brand": "RELX",
    "category": "Parts - Pods - Closed System",
    "img": img_src,
    "price": "15.99"
  },
  {
    "last_updated":"01/02/2023",
    "source": "SurreyVapes",
    "id": 8211075432688,
    "name": "RELX Pro 1.9ml Pods - Precious Plum",
    "brand": "RELX",
    "category": "Parts - Pods - Closed System",
    "img": img_src,
    "price": "15.99"
  },
  {
    "last_updated":"01/02/2023",
    "source": "SurreyVapes",
    "id": 8211075170544,
    "name": "RELX Pro 1.9ml Pods - Strawberry Mango",
    "brand": "RELX",
    "category": "Parts - Pods - Closed System",
    "img": img_src,
    "price": "15.99"
  },
  {
    "last_updated":"01/02/2023",
    "source": "ThunderbirdVapes",
    "id": 8211073728752,
    "name": "RELX Pro 1.9ml Pods - Classic Tobacco",
    "brand": "RELX",
    "category": "Parts - Pods - Closed System",
    "img": img_src,
    "price": "15.99"
  },
  {
    "last_updated":"01/02/2023",
    "source": "ThunderbirdVapes",
    "id": 8211073695984,
    "name": "RELX Pro 1.9ml Pods - Ice Tobacco",
    "brand": "RELX",
    "category": "Parts - Pods - Closed System",
    "img": img_src,
    "price": "15.99"
  },
]

function CardList() {
  return (
    <div className="card_container">  
        {products.map( (product, idx)=> 
          <Card key={idx} product={product}/>)}     
    </div>
  );
}

export default CardList;