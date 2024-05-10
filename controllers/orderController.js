const Order = require('../models/orderModel'); // Importa el modelo de pedido

// Función para crear un nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const { userId, cart } = req.body; // Obtener userId y carrito de la solicitud

    // Crear un nuevo pedido utilizando los datos del carrito
    const newOrder = new Order({
      user: userId,
      orderNumber: generateOrderNumber(),
      items: cart.items, // Utiliza los elementos del carrito como elementos del pedido
      totalPrice: cart.totalPrice, // Utiliza el precio total del carrito para el pedido
      status: 'pendiente',
      shippingAddress:null,
      paymentMethod:null,
    });

    // Guardar el nuevo pedido en la base de datos
    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
};

function generateOrderNumber() {
  // Lógica para generar un número de pedido único
  return Math.floor(Math.random() * 1000000).toString(); // Por ejemplo, genera un número aleatorio de 6 dígitos
}

// Función para obtener todos los pedidos
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Obtener el ID del pedido de los parámetros de la solicitud

    // Buscar el pedido por su ID en la base de datos
    const order = await Order.findById(orderId);

    if (!order) {
      // Si no se encuentra el pedido, responder con un mensaje de error
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Responder con el pedido encontrado
    res.status(200).json(order);
  } catch (error) {
    // Manejar cualquier error y responder con un mensaje de error
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el pedido' });
  }
};

// Otras funciones para actualizar, eliminar pedidos, obtener un pedido específico, etc.

// ...

module.exports = exports;
