const jwt = require('jsonwebtoken');
const config = require('../config/auth-config'); // Configuración que contiene la clave secreta del JWT
const User = require('../models/userModel');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  jwt.verify(token, config.secretKey, async (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token.' });
    }

    req.userId = decoded.id;
    req.user = await User.findById(decoded.id).populate('roles');
    next();
  });
};

