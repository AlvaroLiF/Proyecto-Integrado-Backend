const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: String,
  values: [String],
  // Define las claves y valores de las especificaciones
}, {
  _id: false // Indica a Mongoose que no genere un _id para cada especificación
});

const productSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
  },
  specifications: {
    type: Object,
    default: {}
  },
  photos: {
    type: [String],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
