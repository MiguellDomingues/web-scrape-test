import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      SearchType: {
        keyFields: ["type_name"],
      },
      Query: {
        fields: {

          getProducts: {
            read(existing, { args: {last_product_id, category, stores, brands }}) {

             // console.log("read:", "l_id:", last_product_id, "c:", category, "s:", stores, "b:", brands, " existing: ", existing)


              
              return existing
            },
            // Don't cache separate results based on
            // any of this field's arguments.
            keyArgs: [],              
            // false :                                              home page infinite callouts on scroll/merging
            //["category", "stores", "brands","last_product_id"]    one callout max
            //["category", "stores", "brands",]                     home page infinite callouts on scroll/merging
            //[]                                                    home page infinite callouts on scroll/merging

            // Concatenate the incoming list items with
            // the existing list items.
            merge(existing = [], incoming) {
             // console.log("CACHE: existing: ", existing.length, " incoming: ", incoming)
              return [...existing, ...incoming];
            },
          }
        }
      }
    }
  }),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
