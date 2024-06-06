const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor, escriba un nombre de usuario'],
    unique: true,
    trim: true,
    match: /^\S+$/
  },
  password: {
    type: String,
    required: [true, 'Por favor, escriba una contraseña']
  },
  email: {
    type: String,
    required: [true, 'Por favor, escribe un email'],
    trim: true,
    unique: true,
    match: /^\S+@\S+$/
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    }
  ],
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  shippingAddresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShippingAddress',
    },
  ],
  paymentMethods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMethod',
    },
  ],
  billingAddresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BillingAddress',
    },
  ],
  defaultShippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingAddress',
    default: null
  },
  defaultPaymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    default: null
  },
  defaultBillingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillingAddress',
    default: null
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
