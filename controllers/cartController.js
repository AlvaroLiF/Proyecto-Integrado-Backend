const { Cart, CartItem } = require('../models/cartModel');
const Product = require('../models/productModel');


// Crear un nuevo carrito
exports.createCart = (req, res) => {
  const newCart = new Cart({
    user: req.body.userId, // Asigna el usuario al carrito
    items: [], // Inicialmente, el carrito estará vacío
    totalPrice: 0, // Inicialmente, el precio total es cero
  });

  newCart.save((err, cart) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    return res.status(201).json(cart);
  });
};

// Agregar un elemento al carrito
exports.addToCart = async (req, res) => {
  try {
    const productId = req.body.productId; // ID del producto a agregar
    const quantity = req.body.quantity; // Cantidad del producto a agregar
    const userId = req.body.userId; // ID del usuario

    // Busca el carrito del usuario
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Se requiere productId y quantity' });
    }

    // Obtener el producto correspondiente al productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);
    if (existingItemIndex !== -1) {
      // Si el producto ya está en el carrito, actualiza la cantidad
      cart.items[existingItemIndex].quantity += quantity;
      console.log(quantity);
    } else {
      // Si el producto no está en el carrito, crea un nuevo elemento del carrito
      const newItem = new CartItem({
        cart: cart._id,
        product: productId,
        quantity: quantity
      });

      await newItem.save();
  
      // Agregar el nuevo cartItem al carrito
      cart.items.push(newItem);
    }

    // Actualiza el precio total con redondeo
    cart.totalPrice = Math.round((cart.totalPrice + (quantity * product.price)) * 100) / 100;
    console.log(cart.totalPrice);

    await cart.save();

    return res.status(201).json(cart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    return res.status(500).send({ message: error.message || 'Error al agregar producto al carrito' });
  }
};


// Obtener el carrito de un usuario
exports.getCart = (req, res) => {
  Cart.findOne({ user: req.params.userId })
    .populate('items.product') // Carga la información del producto asociado a cada elemento
    .exec()
    .then(cart => {
      if (!cart) {
        return res.status(404).send({ message: 'Carrito no encontrado' });
      }
      return res.status(200).json(cart);
    })
    .catch(err => {
      return res.status(500).send({ message: err.message });
    });
};


// Eliminar un elemento del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId; // ID del producto a eliminar

    // Busca el carrito del usuario
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

    // Encuentra el índice del elemento en el carrito
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).send({ message: 'Elemento no encontrado en el carrito' });
    }

    const removedItemId = cart.items[itemIndex]._id;
    await CartItem.findByIdAndDelete(removedItemId);

    // Encuentra el producto correspondiente en la base de datos
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    // Remueve el elemento del carrito y ajusta el precio total
    const removedItem = cart.items.splice(itemIndex, 1)[0];
    cart.totalPrice = Math.round((cart.totalPrice - (removedItem.quantity * product.price)) * 100) / 100;

    // Guarda el carrito actualizado en la base de datos
    await cart.save();

    return res.status(204).send(); // Retorna un código de estado 204 (Sin contenido) si la eliminación fue exitosa
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    return res.status(500).send({ message: error.message || 'Error al eliminar producto del carrito' });
  }
};

// Método para vaciar el carrito
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Buscar el carrito del usuario por su ID
    const cart = await Cart.findOne({ user: userId });

    // Si no se encuentra el carrito, enviar una respuesta de error
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Vaciar el carrito eliminando todos los productos
    cart.items = [];
    cart.totalPrice = 0;

    // Guardar los cambios en el carrito
    await cart.save();

    // Enviar una respuesta de éxito
    res.status(200).json({ message: 'Carrito vaciado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al vaciar el carrito' });
  }
};
