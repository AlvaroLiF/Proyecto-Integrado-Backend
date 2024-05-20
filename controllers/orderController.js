const Order = require('../models/orderModel'); // Importa el modelo de pedido
const moment = require('moment'); // Importar la librería moment.js para trabajar con fechas
const User = require('../models/userModel');


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

    // Actualizar el usuario para agregar el nuevo pedido a su lista de pedidos
    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });

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
    res.status(500).json({ message: 'Error al obtener el pedidos' });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Obtener el ID del pedido de los parámetros de la solicitud

    // Eliminar el pedido por su ID en la base de datos
    const result = await Order.findByIdAndDelete(orderId);

    if (!result) {
      // Si no se encuentra el pedido, responder con un mensaje de error
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Responder con un mensaje de éxito
    res.status(200).json({ message: 'Pedido eliminado exitosamente' });
  } catch (error) {
    // Manejar cualquier error y responder con un mensaje de error
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el pedido' });
  }
};

exports.getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }).populate('user', 'username email');

    if (!orders) {
      return res.status(404).json({ message: 'Pedidos no encontrados' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
};

// Función para eliminar pedidos incompletos de la base de datos
async function deleteIncompleteOrders() {
  try {
    // Calcular la fecha límite para la completitud del pedido (por ejemplo, 60 minutos atrás)
    const deadline = moment().subtract(60, 'minutes').toDate();

    // Buscar pedidos con shippingAddress o paymentMethod nulos y que hayan sido creados hace más de 60 minutos
    const incompleteOrders = await Order.find({
      $or: [{ shippingAddress: null }, { paymentMethod: null }],
      createdAt: { $lt: deadline } // createdAt es el campo que indica la fecha de creación del pedido
    });

    const orderIds = incompleteOrders.map(order => order._id);

    // Eliminar los pedidos encontrados
    await Order.deleteMany({ _id: { $in: orderIds } });

    // Eliminar las referencias a los pedidos eliminados en los documentos de los usuarios
    await User.updateMany(
      { orders: { $in: orderIds } },
      { $pull: { orders: { $in: orderIds } } }
    );

    console.log('Pedidos incompletos eliminados con éxito.');
  } catch (error) {
    console.error('Error al eliminar pedidos incompletos:', error);
  }
}

setInterval(deleteIncompleteOrders, 60 * 60 * 1000); // Ejecutar cada hora

// ...

module.exports = exports;
