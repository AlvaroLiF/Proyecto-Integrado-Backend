const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', // Modelo de productos
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Modelo de productos
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
},
{
  timestamps: true,
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',// Modelo de usuarios
    required: true, 
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
  },
},
{
  timestamps: true,
});

const Cart = mongoose.model('Cart', cartSchema);

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = { Cart, CartItem};
