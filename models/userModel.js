const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor, escriba un nombre de usuario'],
    uniqueCaseInsensitive: true,
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
    uniqueCaseInsensitive: true,
    match: /^\S+@\S+$/
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role', // Hace referencia al modelo de roles
    }
  ],
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', // Modelo de carrito
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Nombre del modelo de pedidos
    },
  ],

});

const User = mongoose.model('User', userSchema);

module.exports = User;
