# GraphQL-Backend-Marketplace
Utilizes MongoDB, NodeJS, and GraphQL to host products and manage inventory. Handles virtual shopping cart logic.

GraphQL Statements:

To start out, a cart needs to be created to put the items in:
```
  mutation {
    createCart
  }
```
The response will be the ID of the cart we will be using. Be sure to copy it! Next, we can take a look at the products we have in the database:
```
  query {
    products(in_stock:true) {
      id
      title
      price
      inventory_count
    }
  }
```
  
Copy an id from a product you wish to buy. The cart id and product id will be used for the following statement:
```
  mutation {
    addToCart(cart_id: "PUT CART ID HERE", product_id: "PUT PRODUCT ID HERE", quantity: 10)
  }
```  
To view your cart, use this query with any of the optional return values:
```
  query {
    cart(id: "PUT CART ID HERE") {
      line_items {
        product {
          id
          title
          price
          inventory_count
        }
        quantity
      }
      total_price
    }
  }
```  
Once you have items in your cart, you will be able to purchase it. The purchase will only go through if quantity is available.
```
  mutation {
    purchaseCart(cart_id: "PUT CART ID HERE")
  }
```  
Doing this will delete the cart from the database and update the inventory_count of relevant products.
  

Node Modules:
  GraphQL
  Express
  Express-GraphQL
  Mongoose










 
Hello! I constructed this as a solution the 2019 Shopify Internship Challenge for Backend Developer. I just wanted to quickly go over my thought process in developing this, and what I would do differently if given some more details.

I'll be going over a few thoughts I had on the tasks laid out for me:

  `The ability to fetch products all at once or one at a time:`
    
GraphQL definitely helped simply this process and it was exciting to learn what it can do. I was able to setup optional query parameters for specific product properties such as the product ID or Title.
    
  `Products with a title, price, and inventory_count:`
  
I defined the products schema and product type in both GraphQL and MongoDB. I also defined a mutation to add new products to the database.
   
  `The ability to query for products with available inventory:`
  
One of the optional query parameters I created was "in_stock" When set to true, only returns products with inventory_count > 0.
  
  `The ability to purchase products, but only if they have available inventory:`
  
In the original assignment, we only needed to reduce the inventory by one, but I felt it should be a bit more flexible. Let the user purchase multiple of the same item and verify that there is enough inventory to do so.
  
  
If I were to change anything, I would maybe change inventory and quantity to be floats. Perhaps the store sells things in KGs or grams and that would simply logic at all. Also, I think a cart should automatically be created by "addToCart" if no cart exists.
    
  
    
  
