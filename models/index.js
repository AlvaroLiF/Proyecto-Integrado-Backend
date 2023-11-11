const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./userModel");
db.role = require("./roleModel");
db.category = require("./categoryModel");
db.cart = require("./cartModel");
db.order = require("./orderModel");
db.product = require("./productModel");

db.ROLES = ["user", "admin"];
db.CATEGORIES = ["Gaming", "Portátiles", "Componentes", "Monitores", "Smartphones", "Televisores", "Hogar"];

module.exports = db;
