// middleware/auth.js

const jwt = require('jsonwebtoken');
const config = require('../config'); // Configuración que contiene la clave secreta del JWT

function authenticateUser(req, res, next) {
  // Obtiene el token de autorización de la solicitud
  const token = req.header('Authorization');

  // Verifica si se proporcionó un token
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // Verifica y decodifica el token JWT
    const decoded = jwt.verify(token, config.secretKey);

    // Agrega el usuario autenticado a la solicitud para su uso posterior
    req.user = decoded.user;

    // Continúa con la siguiente función de middleware
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido.' });
  }
}

module.exports = authenticateUser;
