const Order = require('../models/orderModel');
const PaymentMethod = require('../models/paymentModel');
const User = require('../models/userModel');
const { sendOrderConfirmation } = require('../middlewares/mailer');

exports.createPaymentMethod = async (req, res) => {
  try {
    const { userId, cardNumber, expirationDate, securityCode, cardholderName, isDefault } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear el nuevo método de pago
    const newPaymentMethod = new PaymentMethod({
      user: userId,
      cardNumber,
      expirationDate,
      securityCode,
      cardholderName,
      isDefault
    });

    // Si es el método de pago predeterminado, actualizar el usuario
    if (isDefault) {
      // Desactivar el isDefault de otros métodos de pago
      await PaymentMethod.updateMany(
        { user: userId, _id: { $ne: newPaymentMethod._id } },
        { $set: { isDefault: false } }
      );
      // Establecer el nuevo método de pago como predeterminado
      user.defaultPaymentMethod = newPaymentMethod._id;
    }

    // Guardar el método de pago
    const savedPaymentMethod = await newPaymentMethod.save();

    // Actualizar los métodos de pago del usuario
    user.paymentMethods.push(savedPaymentMethod._id);
    await user.save();

    res.status(201).json(savedPaymentMethod);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el método de pago' });
  }
};

exports.editPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const { userId, cardNumber, expirationDate, securityCode, cardholderName, isDefault } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log(paymentMethodId);

    // Encontrar y actualizar el método de pago
    const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
      paymentMethodId,
      {
        cardNumber,
        expirationDate,
        securityCode,
        cardholderName,
        isDefault
      },
      { new: true }
    );

    if (!updatedPaymentMethod) {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    }

    // Si el método de pago es predeterminado, actualizar el usuario y desactivar isDefault en otros métodos
    if (isDefault) {
      await PaymentMethod.updateMany(
        { user: userId, _id: { $ne: paymentMethodId } },
        { $set: { isDefault: false } }
      );
      user.defaultPaymentMethod = updatedPaymentMethod._id;
    }

    await user.save();

    res.status(200).json(updatedPaymentMethod);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al editar el método de pago' });
  }
};



exports.assignPaymentMethodToOrder = async (req, res) => {
  try {
    const { orderId, paymentMethodId } = req.body;

    const order = await Order.findById(orderId);
    const paymentMethod = await PaymentMethod.findById(paymentMethodId);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    }

    order.paymentMethod = paymentMethodId;
    await order.save();

    res.status(200).json({ message: 'Método de pago asignado correctamente al pedido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar el método de pago al pedido' });
  }
};

exports.confirmPaymentAndSendEmail = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('user')
      .populate('items.product._id');

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const orderItems = order.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      productPhoto: item.product.photos && item.product.photos.length > 0 ? item.product.photos[0] : 'No Image'
    }));

    const orderDetails = {
      orderNumber: order.orderNumber,
      items: orderItems,
      totalPrice: order.totalPrice,
      status: order.status
    };

    if (order.user && order.user.email) {
      sendOrderConfirmation(order.user.email, orderDetails);
    }

    res.status(200).json({ message: 'Pago confirmado y correo electrónico enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al confirmar el pago y enviar el correo electrónico' });
  }
};

exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentMethodId } = req.body;

    await User.findByIdAndUpdate(userId, { defaultPaymentMethod: paymentMethodId });
    await PaymentMethod.updateMany({ user: userId }, { $set: { isDefault: false } });
    await PaymentMethod.findByIdAndUpdate(paymentMethodId, { isDefault: true });

    res.status(200).json({ message: 'Método de pago predeterminado actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el método de pago predeterminado' });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const { userId, paymentMethodId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Filtrar los métodos de pago del usuario
    user.paymentMethods = user.paymentMethods.filter(method => method.toString() !== paymentMethodId);

    // Verificar si el método de pago a eliminar es el predeterminado
    if (user.defaultPaymentMethod && user.defaultPaymentMethod.toString() === paymentMethodId) {
      // Si hay más métodos de pago, establecer un nuevo método de pago predeterminado
      if (user.paymentMethods.length > 0) {
        const newDefaultPaymentMethodId = user.paymentMethods[0];
        user.defaultPaymentMethod = newDefaultPaymentMethodId; // Establecer el primer método de pago como el nuevo predeterminado

        // Actualizar el campo isDefault del nuevo método de pago predeterminado
        await PaymentMethod.findByIdAndUpdate(newDefaultPaymentMethodId, { isDefault: true });
      } else {
        user.defaultPaymentMethod = null; // No hay más métodos de pago, establecer como null
      }
    }

    // Guardar los cambios en el usuario
    await user.save();

    // Eliminar el método de pago de la base de datos
    await PaymentMethod.findByIdAndDelete(paymentMethodId);

    res.status(200).json({ message: 'Método de pago eliminado y referencia actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el método de pago' });
  }
};


module.exports = exports;
