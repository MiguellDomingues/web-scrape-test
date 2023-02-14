import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
    query GetProducts($category: String!, $stores: [String!], $brands: [String!]) {
        getProducts(category: $category, stores: $stores, brands: $brands){
            id, source_id,  source_url, last_updated
        info{
            brand, category_str, name, img_src, price, info_url
            }   
        }   
    }
`;

//$breed: String!
