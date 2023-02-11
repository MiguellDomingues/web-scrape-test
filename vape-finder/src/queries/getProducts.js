import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
    query GetProducts($tags: [String!]) {
        getProducts(tags: $tags){
            id, source_id,  source_url, last_updated
        info{
            brand, category_str, name, img_src, price, info_url
            }   
        }   
    }
`;

//$breed: String!
