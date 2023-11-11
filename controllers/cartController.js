const Cart = require('../models/cartModel');
const CartItem = require('../models/cartModel');

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
exports.addToCart = (req, res) => {
  const productId = req.body.productId; // ID del producto a agregar
  const quantity = req.body.quantity; // Cantidad del producto a agregar

  // Busca el carrito del usuario
  Cart.findOne({ user: req.body.userId }, (err, cart) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (!cart) {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

    // Crea un nuevo elemento del carrito
    const newItem = new CartItem({
      product: productId,
      quantity: quantity,
    });

    // Agrega el elemento al carrito
    cart.items.push(newItem);
    cart.totalPrice += newItem.quantity * product.price; // Actualiza el precio total

    cart.save((err, updatedCart) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      return res.status(201).json(updatedCart);
    });
  });
};

// Obtener el carrito de un usuario
exports.getCart = (req, res) => {
  Cart.findOne({ user: req.params.userId })
    .populate('items.product') // Carga la información del producto asociado a cada elemento
    .exec((err, cart) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      if (!cart) {
        return res.status(404).send({ message: 'Carrito no encontrado' });
      }
      return res.status(200).json(cart);
    });
};

// Eliminar un elemento del carrito
exports.removeFromCart = (req, res) => {
  Cart.findOne({ user: req.params.userId }, (err, cart) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (!cart) {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product == req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).send({ message: 'Elemento no encontrado en el carrito' });
    }

    // Elimina el elemento del carrito y ajusta el precio total
    const removedItem = cart.items.splice(itemIndex, 1)[0];
    cart.totalPrice -= removedItem.quantity * removedItem.product.price;

    cart.save((err, updatedCart) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      return res.status(204).send();
    });
  });
};
