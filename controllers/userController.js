const User = require('../models/userModel'); // Importa el modelo de usuario
const jwt = require('jsonwebtoken');
//const config = require('../config/auth-config');

// Función para crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Verifica si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const newUser = new User({
      username,
      password, // Aquí debes realizar el hash de la contraseña
      email,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

// Función para autenticar un usuario y generar un token JWT
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Aquí debes verificar la contraseña con la contraseña almacenada en la base de datos
    // Si las contraseñas coinciden, genera un token JWT y devuelve la respuesta con el token
    // (puedes utilizar el paquete 'jsonwebtoken' para esto).

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la autenticación' });
  }
};

// Otras funciones para obtener información de usuario, actualizar datos, etc.

// ...

module.exports = exports;
