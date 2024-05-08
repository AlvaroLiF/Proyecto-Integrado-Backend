const ShippingAddress = require('../models/ShippingModel');
const Order = require('../models/orderModel');

// Controlador para crear una nueva dirección de envío
exports.createShippingAddress = async (req, res) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const { firstName, lastName, country, mobile, addressLine1, addressLine2, postalCode, city, state, additionalInfo, orderId } = req.body;

    // Verificar si se proporcionó un ID de pedido válido
    if (!orderId) {
      return res.status(400).json({ message: 'Se requiere un ID de pedido válido' });
    }

    // Verificar si el pedido asociado existe en la base de datos
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'El pedido asociado no fue encontrado' });
    }

    // Crear una nueva instancia de ShippingAddress con los datos proporcionados
    const newShippingAddress = new ShippingAddress({
      firstName,
      lastName,
      country,
      mobile,
      addressLine1,
      addressLine2,
      postalCode,
      city,
      state,
      additionalInfo,
      order: orderId // Asignar el ID del pedido a la referencia del pedido en la dirección de envío
    });

    // Guardar la nueva dirección de envío en la base de datos
    const savedShippingAddress = await newShippingAddress.save();

    // Responder con la dirección de envío creada
    res.status(201).json(savedShippingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la dirección de envío' });
  }
};

// Otros controladores como obtener, actualizar, eliminar dirección de envío pueden ir aquí

// ...

module.exports = exports;
