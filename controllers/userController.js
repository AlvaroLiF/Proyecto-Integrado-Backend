const db = require("../models");
const User = db.user;
const Role = db.role;
const Cart = db.cart;
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");


exports.signup = async (req, res) => {
  try {

    const {username, password, email} = req.body;

    const hashPassword = await bcrypt.hash(password, 8);
   
    const token = jwt.sign({ id: User.id }, config.secret, {
      expiresIn: "1y" 
    });

    const role = req.body.roles ? await Role.findOne({ name: req.body.roles }) : await Role.findOne({ name: 'User' });

    if (!role) {
      return res.status(400).send({ message: "Error, el rol no es válido" });
    }
   
    const newUser = new User({

      username: username.toLowerCase(),
      email: email.toLowerCase(),
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

    if (!user.cart) {
      // Si no tiene un carrito, crear uno nuevo
      const newCart = new Cart({ user: user._id });
      await newCart.save();

      // Asociar el carrito al usuario
      await User.findByIdAndUpdate(user._id, { cart: newCart._id });
    }

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

    const token = jwt.sign({ id: User.id }, config.secret, {
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

// Otras funciones para obtener información de usuario, actualizar datos, etc.

// ...

module.exports = exports;