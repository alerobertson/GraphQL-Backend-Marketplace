/*
	Author: Alexander J Robertson
	Start Date: January 2019
	translator.js
	
	I made this to bundle all MongoDB statements as to not clutter the main script.
*/
const mongoose = require('mongoose')
const connection = mongoose.createConnection('mongodb+srv://graphql_user:graphql_password@' +
	'test-cluster-khuin.gcp.mongodb.net/test', { useNewUrlParser: true })
const DB = require('../models/marketplace')

// ------ MongoDB Collections ------ ------

const Products = connection.model('products', DB.productSchema)
const Carts = connection.model('carts', DB.cartSchema)

// ------ Queries ------ ------ ------

function getProducts(query) {
	return new Promise((resolve, reject) => {
		
		// Rename property id to _id for MongoDB
		if(query.id) { query._id = query.id; delete query.id; }
		
		// Remove temporary in_stock property since it will make the MongoDB query invalid if it remains
		let in_stock = null
		if(query.hasOwnProperty('in_stock')) {
			in_stock = query.in_stock
			delete query.in_stock
		}

		// GraphQL query is formatted very closely to MongoBD query
		Products.find(query, (err, products) => {
			
			if(products == undefined) { resolve(null); return }
			if(in_stock != null) {
				products = products.filter((product) => {
					return in_stock ? product.inventory_count > 0 : product.inventory_count <= 0
				})
			}
			
			// Convert MongoDB query result into Product Objects
			let result = products.map((product) => {
				return new DB.Product(product._id.toString(),
					product.title, product.price, product.inventory_count)
			})
			
			// Return array of Product Objects
			resolve(result)
		})
	})
}

function getCart(cart_id) {
	return new Promise((resolve, reject) => {
		Carts.findOne({'_id': cart_id}, (err, cart) => {
			if(cart == null) { reject("No cart with specified id exists."); return }
				
			let product_ids = cart.product_ids.map((product) => {
				return product.toString()
			})
				
			let line_items = DB.calculateQuantity(product_ids)
				
			Products.find({ _id : { $in : product_ids } }, (err, products) => {
				line_items = line_items.map((item) => {
					let index = products.map(p => p._id.toString()).indexOf(item._id)

					let product = products[index]

					return {
						'product' : new DB.Product(product._id.toString(), product.title, product.price, product.inventory_count),
						'quantity' : item.quantity
					}
				})
				let result = new DB.Cart(cart_id, line_items)
				resolve(result)
			})
		})
	})
}

// ------ Mutations ------ ------

function newProduct(product) {
	Products.collection.insertOne(product)
	return `Added product: ${object.title}`
}

function createCart() {
	return new Promise((resolve, reject) => {
		Carts.collection.insertOne({
			'product_ids': [ ]
		}).then((response) => { resolve(response.insertedId.toString()) })
	})
}

function addToCart(cart_id, product_id, quantity) {
	return new Promise((resolve, reject) => {
		let product_ids = []
			
		for (i = 0; i < quantity; i++) {
			product_ids.push(product_id)
		}
		// Push product_ids to the referenced cart object in MongoDB
		Carts.updateOne({'_id': cart_id}, { $push: { product_ids: { $each: product_ids } } }).then((result) => {
			resolve(`Added product(s) to cart: ${cart_id}`)
		},
		(error) => {
			reject(error)
		})
	})
}

function purchaseCart(cart_id) {
	return new Promise((resolve, reject) => {
		getCart(cart_id).then((cart) => {
			if(DB.verifyQuantity(cart)) {
				console.log('Quantity is valid!')

				cart.line_items.forEach((line_item) => {
					let product_id = line_item.product.id
					let quantity = line_item.quantity
					Products.updateOne({'_id':product_id}, { $inc: { 'inventory_count': -quantity } }).then((result) => {
						console.log("Modified Products: " + result.nModified)
					})
				})
				Carts.deleteOne({'_id': cart_id}).then((result) => {
					console.log(`Cart ${cart_id} deleted.`)
					resolve("Purchase Success")
				})				
				
			}
			else { // (verifyQuantity(cart)
				console.log('Quantity is invalid!')
				reject("Product in this cart is out of stock!")
			}
		}, (error) => { // getCart(cart_id)
			reject(error)
		})
	})
}

module.exports = {
	getProducts: getProducts,
    getCart: getCart,
	newProduct: newProduct,
	createCart: createCart,
	purchaseCart: purchaseCart,
	addToCart: addToCart
}