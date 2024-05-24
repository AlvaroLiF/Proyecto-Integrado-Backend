const Product = require('../models/productModel'); // Importa el modelo de producto

// Función para crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, features, specifications, photos, category, featured } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      features,
      specifications,
      photos,
      category,
      featured
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

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });
    res.status(200).json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    // Obtiene el ID del producto desde los parámetros de la solicitud
    const productId = req.params.productId;

    // Busca el producto por su ID en la base de datos
    const product = await Product.findById(productId);

    // Si el producto no se encuentra, devuelve un mensaje de error
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Devuelve los detalles del producto como respuesta
    res.status(200).json(product);
  } catch (error) {
    // Maneja los errores y devuelve un mensaje de error
    console.error('Error al obtener detalles del producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm; // Recupera el término de búsqueda de la URL
    
    // Realiza la búsqueda de productos en la base de datos
    const results = await Product.find({ name: { $regex: searchTerm, $options: 'i' } });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ message: 'Error al buscar productos' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Buscar y eliminar el producto
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;

    // Buscar y actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

module.exports = exports;
