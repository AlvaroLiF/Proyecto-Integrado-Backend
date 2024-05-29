const db = require("../models");
const User = db.user;
const Role = db.role;
const { Cart } = require('../models/cartModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");
const { generateResetToken, sendResetPasswordEmail } = require("../middlewares/mailer");


exports.signup = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({ message: "Todos los campos son requeridos" });
    }

    let errorMessage = "";

    // Verificar si el nombre de usuario ya existe
    const existingUsername = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (existingUsername) {
      errorMessage += "El nombre de usuario ya está en uso. ";
    }

    // Verificar si el correo electrónico ya existe
    const existingEmail = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existingEmail) {
      errorMessage += "El correo electrónico ya está en uso. ";
    }

    if (errorMessage) {
      return res.status(400).send({ message: errorMessage.trim() });
    }

    const hashPassword = await bcrypt.hash(password, 8);

    const role = req.body.roles ? await Role.findOne({ name: req.body.roles.toLowerCase() }) : await Role.findOne({ name: 'User' });

    if (!role) {
      return res.status(400).send({ message: "Error, el rol no es válido" });
    }

    const newUser = new User({
      username: username,
      email: email,
      password: hashPassword,
      roles: [role._id]
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, config.secretKey, {
      expiresIn: "1y"
    });

    res.status(200).send({
      username: newUser.username,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).send({ message: "Se requiere nombre de usuario o correo electrónico" });
    }

    if (!password) {
      return res.status(400).send({ message: "Se requiere contraseña" });
    }

    const user = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    }).populate("roles", "-__v");

    if (!user) {
      return res.status(404).send({ message: "El nombre de usuario o el correo no son correctos." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "La contraseña no es correcta."
      });
    }

    if (!user.cart) {
      const newCart = new Cart({
        user: user._id,
        items: [],
        totalPrice: 0,
      });

      await newCart.save();
      user.cart = newCart._id;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, config.secretKey, {
      expiresIn: "1y"
    });

    const roles = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: roles,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('roles', 'name'); // Poblamos los roles con solo el campo name
    res.status(200).json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

exports.addAdminRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const adminRole = await Role.findOne({ name: 'Admin' });

    if (!adminRole) {
      return res.status(404).json({ message: 'Role "admin" not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.roles.includes(adminRole._id)) {
      return res.status(400).json({ message: 'User already has the "admin" role' });
    }

    user.roles.push(adminRole._id);
    await user.save();

    res.status(200).json({ message: 'Role "admin" added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding admin role' });
  }
};

exports.removeAdminRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const adminRole = await Role.findOne({ name: 'Admin' });

    if (!adminRole) {
      return res.status(404).json({ message: 'Role "admin" not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roleIndex = user.roles.indexOf(adminRole._id);
    if (roleIndex > -1) {
      user.roles.splice(roleIndex, 1);
      await user.save();
    }

    res.status(200).json({ message: 'Role "admin" removed successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing admin role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Buscar y eliminar el producto
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

exports.viewProfile = async (req, res) => {
  try {
    const userId = req.params.userId; // Obtener el ID del pedido de los parámetros de la solicitud

    // Buscar el pedido por su ID en la base de datos
    const user = await User.findById(userId);

    if (!user) {
      // Si no se encuentra el pedido, responder con un mensaje de error
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Responder con el pedido encontrado
    res.status(200).json(user);
  } catch (error) {
    // Manejar cualquier error y responder con un mensaje de error
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Username y email son requeridos' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.username = username;
    user.email = email;

    await user.save();
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil del usuario', error });
  }
};

exports.verifyPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'La contraseña actual es requerida' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    res.status(200).json({ message: 'Contraseña verificada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar la contraseña', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Ambas contraseñas nuevas son requeridas' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas nuevas no coinciden' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findById(userId);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
  }
};

exports.sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar al usuario por su correo electrónico en la base de datos
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar token de restablecimiento de contraseña
    const resetToken = generateResetToken(user);

    // Enviar correo electrónico con el enlace de restablecimiento de contraseña
    await sendResetPasswordEmail(email, resetToken);

    res.status(200).json({ message: 'Correo electrónico de restablecimiento de contraseña enviado' });
  } catch (error) {
    console.error('Error al enviar el correo electrónico de restablecimiento de contraseña:', error);
    res.status(500).json({ message: 'Error al enviar el correo electrónico de restablecimiento de contraseña' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verificar si el token es válido
    const decodedToken = jwt.verify(token, config.secretKey);

    // Buscar al usuario por su ID en la base de datos
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar la contraseña del usuario
    user.password = await bcrypt.hash(newPassword, 8);
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};


// Otras funciones para obtener información de usuario, actualizar datos, etc.

// ...

module.exports = exports;