const Category = require('../models/categoryModel'); // Importa el modelo de categoría

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

// Otras funciones para actualizar, eliminar categorías, obtener una categoría específica, etc.

// ...

module.exports = exports;
