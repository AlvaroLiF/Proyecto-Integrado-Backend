const Order = require('../models/orderModel');
const PaymentMethod = require('../models/paymentModel');
const { sendOrderConfirmation } = require('../middlewares/mailer');

exports.createPaymentMethod = async (req, res) => {
  try {
    const { cardNumber, expirationDate, securityCode, cardholderName, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Se requiere un ID de pedido válido' });
    }

    const existingOrder = await Order.findById(orderId)
      .populate('user')
      .populate('items.product._id'); // Poblar la referencia del producto

    if (!existingOrder) {
      return res.status(404).json({ message: 'El pedido asociado no fue encontrado' });
    }

    const newPaymentMethod = new PaymentMethod({
      cardNumber,
      expirationDate,
      securityCode,
      cardholderName,
      order: orderId
    });

    const savedPaymentMethod = await newPaymentMethod.save();

    existingOrder.paymentMethod = savedPaymentMethod._id;
    await existingOrder.save();

    const orderItems = existingOrder.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      productPhoto: item.product.photos && item.product.photos.length > 0 ? item.product.photos[0] : 'No Image'
    }));

    const orderDetails = {
      orderNumber: existingOrder.orderNumber,
      items: orderItems,
      totalPrice: existingOrder.totalPrice,
      paymentMethod: savedPaymentMethod.cardholderName,
      status: existingOrder.status
    };

    const user = existingOrder.user;
    if (user && user.email) {
      sendOrderConfirmation(user.email, orderDetails);
    }

    res.status(201).json(savedPaymentMethod);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el método de pago' });
  }
};

module.exports = exports;
