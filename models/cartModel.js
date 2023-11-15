const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Modelo de productos
  },
  quantity: {
    type: Number,
    required: true,
  },
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
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
