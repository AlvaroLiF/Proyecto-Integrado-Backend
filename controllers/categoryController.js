const Category = require('../models/categoryModel'); // Importa el modelo de categoría
const Product = require('../models/productModel');

// Función para crear una nueva categoría
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    const newCategory = new Category({
      name,
    });

    await newCategory.save();
    res.status(201).json({ message: 'Categoría creada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Función para obtener todas las categorías
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Productos no encontrados' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Otras funciones para actualizar, eliminar categorías, obtener una categoría específica, etc.

// ...

module.exports = exports;
