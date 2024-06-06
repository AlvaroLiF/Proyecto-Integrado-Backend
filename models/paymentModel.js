const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: String,
    required: true,
  },
  securityCode: {
    type: String,
    required: true,
  },
  cardholderName: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
