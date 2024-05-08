const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  items: [{
    product: {
      name: {
        type: String,
        required: [true, 'Por favor, escriba un nombre para el producto'],
        uniqueCaseInsensitive: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
      },
      photos: {
        type: [String],
      },
    },
    quantity: {
      type: Number,
      required: true,
    },

  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'enviado', 'entregado'],
    default: 'pendiente',
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingAddress'
  }
},
  {
    timestamps: true,
  });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
