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

},
{
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
