const Order = require('../models/orderModel'); // Importa el modelo de pedido

// Función para crear un nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const { user, orderNumber, items, totalPrice, shippingAddress } = req.body;

    const newOrder = new Order({
      user,
      orderNumber,
      items,
      totalPrice,
      shippingAddress,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Pedido creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
};

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

// Otras funciones para actualizar, eliminar pedidos, obtener un pedido específico, etc.

// ...

module.exports = exports;
