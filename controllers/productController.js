const Product = require('../models/productModel'); // Importa el modelo de producto

// Función para crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, features, specifications, photos, category } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      features,
      specifications,
      photos,
      category,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// Función para obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Otras funciones para actualizar, eliminar productos, obtener un producto específico, etc.

// ...

module.exports = exports;
