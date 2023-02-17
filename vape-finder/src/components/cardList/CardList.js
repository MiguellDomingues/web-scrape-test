import './cardlist.css'
import Card from '../card/Card'

function CardList( { products, fetchNewPage } ) {

  const PRODUCTS_PER_PAGE = 20

  const hasProducts = _ => products.length > 0

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    
    const last_product_id = hasProducts() ? products[products.length-1].id : null

    console.log("last_product_id: ", last_product_id)
    
    if (bottom) { 
//category: $category, stores: $stores, brands: $brands
      console.log("bottom")

      if(hasProducts() && products.length%PRODUCTS_PER_PAGE === 0){
        console.log("fetch Page")
        fetchNewPage({
          variables: {
            last_product_id: last_product_id
          },
        })
      }
    }
  }

  console.log(products)

  return (
    <div className="card_container" onScroll={handleScroll}>  
        {products.map( (product, idx)=> 
          <Card key={idx} product={product}/>)}     
    </div>
  );
}

export default CardList;
/*



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
*/