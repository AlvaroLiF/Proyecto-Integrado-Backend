const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Modelo de productos
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Modelo de usuarios
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'enviado', 'entregado'],
    default: 'pendiente',
  },
  shippingAddress: {
    addressLine1: {
      type: String,
      required: true, // Campo obligatorio
    },
    addressLine2: {
      type: String,
      required: false, // Campo opcional
    },
    city: {
      type: String,
      required: true, // Campo obligatorio
    },
    state: {
      type: String,
      required: true, // Campo obligatorio
    },
    postalCode: {
      type: String,
      required: true, // Campo obligatorio
    },
    country: {
      type: String,
      required: true, // Campo obligatorio
    },

  },

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
