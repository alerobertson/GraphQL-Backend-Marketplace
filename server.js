/*
	Author: Alexander J Robertson
	Start Date: January 2019
	server.js
	
	Hosts a GraphQL server using Express. The goal of this project was to learn GraphQL
	from scratch, and to submit it as a solution to the Shopify Internship 2019 Challenge.
*/
const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const DB = require('./models/marketplace')
const controller = require('./controllers/marketplace-controller')
const fs = require('fs')
const path = require('path')
const graphql_schema = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8")
const app = express()
const port = 12345

app.set('port', port)
	
const schema = buildSchema(graphql_schema)

const root = {
	// Retrieve products based on query parameters.
	// Blank query is also acceptable.
	products: (query) => {
		return controller.getProducts(query)
	},
	
	// Retrieve cart based on cart_id
	cart: (query) => {
		return controller.getCart(query.id)
	},
	
	// Insert product info into database.
	newProduct: (object) => {
		return controller.newProduct(object.product)
	},
	
	// Create a new cart object in database.
	// Returns the ID of the cart.
	createCart: () => {
		return controller.createCart()
	},
	
	// Insert product and quantity into card object
	addToCart: (object) => {
		return controller.addToCart(object.cart_id, object.product_id, object.quantity)
	},
	
	// Remove quantity from database inventory and delete cart.
	// Only completes if there is enough inventory.
	purchaseCart: (object) => {
		return controller.purchaseCart(object.cart_id)
	}
}

app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
	context: { DB }
}))

app.listen(port, () => {
	console.log('server running on localhost:' + port)
})
