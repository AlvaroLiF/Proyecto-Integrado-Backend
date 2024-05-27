const db = require("../models");
const User = db.user;
const Role = db.role;
const { Cart } = require('../models/cartModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");


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

exports.getUsername = async (req, res) => {
  try {
    // El nombre de usuario se puede obtener desde los datos del usuario almacenados en la sesión
    const username = req.user.username;
    console.log(username);
    res.status(200).json({ username: username });
  } catch (error) {
    console.error('Error al obtener el nombre de usuario:', error);
    res.status(500).json({ message: 'Error al obtener el nombre de usuario' });
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


// Otras funciones para obtener información de usuario, actualizar datos, etc.

// ...

module.exports = exports;