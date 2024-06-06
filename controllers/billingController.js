const BillingAddress = require('../models/billingModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

exports.createBillingAddress = async (req, res) => {
  try {
    const { userId, firstName, lastName, country, mobile, addressLine1, addressLine2, postalCode, city, state, additionalInfo, isDefault } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear la nueva dirección de envío
    const newBillingAddress = new BillingAddress({
      user: userId,
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
      isDefault
    });

    // Si es la dirección predeterminada, actualizar el usuario
    if (isDefault) {
      // Desactivar el isDefault de otras direcciones
      await BillingAddress.updateMany(
        { user: userId, _id: { $ne: newBillingAddress._id } },
        { $set: { isDefault: false } }
      );
      // Establecer la nueva dirección como predeterminada
      user.defaultBillingAddress = newBillingAddress._id;
    }

    // Guardar la dirección de envío
    const savedBillingAddress = await newBillingAddress.save();

    // Actualizar las direcciones de envío del usuario
    user.billingAddresses.push(savedBillingAddress._id);
    await user.save();

    res.status(201).json(savedBillingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la dirección de facturación' });
  }
};

exports.editBillingAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId, firstName, lastName, country, mobile, addressLine1, addressLine2, postalCode, city, state, additionalInfo, isDefault } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encontrar y actualizar la dirección de envío
    const updatedBillingAddress = await BillingAddress.findByIdAndUpdate(
      addressId,
      {
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
        isDefault
      },
      { new: true }
    );

    if (!updatedBillingAddress) {
      return res.status(404).json({ message: 'Dirección de envío no encontrada' });
    }

    // Si la dirección es predeterminada, actualizar el usuario y desactivar isDefault en otras direcciones
    if (isDefault) {
      await BillingAddress.updateMany(
        { user: userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
      user.defaultBillingAddress = updatedBillingAddress._id;
    }

    await user.save();

    res.status(200).json(updatedBillingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al editar la dirección de envío' });
  }
};

exports.deleteBillingAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Filtrar las direcciones de envío del usuario
    user.billingAddresses = user.billingAddresses.filter(addr => addr.toString() !== addressId);

    // Verificar si la dirección a eliminar es la predeterminada
    if (user.defaultBillingAddress && user.defaultBillingAddress.toString() === addressId) {
      // Si hay más direcciones, establecer una nueva dirección predeterminada
      if (user.billingAddresses.length > 0) {
        const newDefaultAddressId = user.billingAddresses[0];
        user.defaultBillingAddress = newDefaultAddressId; // Establecer la primera dirección como la nueva predeterminada

        // Actualizar el campo isDefault de la nueva dirección predeterminada
        await BillingAddress.findByIdAndUpdate(newDefaultAddressId, { isDefault: true });
      } else {
        user.defaultBillingAddress = null; // No hay más direcciones, establecer como null
      }
    }

    // Guardar los cambios en el usuario
    await user.save();

    // Eliminar la dirección de envío de la base de datos
    await BillingAddress.findByIdAndDelete(addressId);

    res.status(200).json({ message: 'Dirección de envío eliminada y referencia actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la dirección de envío' });
  }
};

exports.assignBillingAddressToOrder = async (req, res) => {
  try {
    const { orderId, addressId } = req.body;

    const order = await Order.findById(orderId);
    const billingAddress = await BillingAddress.findById(addressId);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (!billingAddress) {
      return res.status(404).json({ message: 'Dirección de facturación no encontrada' });
    }

    order.billingAddress = addressId;
    await order.save();

    res.status(200).json({ message: 'Dirección de facturación asignada correctamente al pedido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar la dirección de facturación al pedido' });
  }
};

module.exports = exports;
