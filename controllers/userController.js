const db = require("../models");
const User = db.user;
const Role = db.role;
const { Cart} = require('../models/cartModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");


exports.signup = async (req, res) => {
  try {

    const {username, password, email} = req.body;

    const hashPassword = await bcrypt.hash(password, 8);
   
    const token = jwt.sign({ id: User.id }, config.secretKey, {
      expiresIn: "1y" 
    });

    const role = req.body.roles ? await Role.findOne({ name: req.body.roles }) : await Role.findOne({ name: 'User' });

    if (!role) {
      return res.status(400).send({ message: "Error, el rol no es válido" });
    }
   
    const newUser = new User({

      username: username,
      email: email,
      password: hashPassword,
      accessToken: token,
      roles: [role._id]
    });

    await newUser.save();

    res.status(200).send({
     username : newUser,
     accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    }).populate("roles", "-__v");

    

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "El Usuario o Contraseña no son correctos."
      });
    }

    if (!user.cart) {
      // Si no tiene un carrito, crear uno nuevo
      const newCart = new Cart({
        user: user._id, // Asigna el usuario al carrito
        items: [], // Inicialmente, el carrito estará vacío
        totalPrice: 0, // Inicialmente, el precio total es cero
      });

      await newCart.save();
      
      // Asociar el carrito al usuario
      user.cart = newCart._id;
      await user.save();
    }

    const token = jwt.sign({ id: User.id }, config.secretKey, {
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
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};


// Otras funciones para obtener información de usuario, actualizar datos, etc.

// ...

module.exports = exports;