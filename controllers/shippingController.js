const ShippingAddress = require('../models/ShippingModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

exports.createShippingAddress = async (req, res) => {
  try {
    const { userId, firstName, lastName, country, mobile, addressLine1, addressLine2, postalCode, city, state, additionalInfo, isDefault } = req.body;

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear la nueva dirección de envío
    const newShippingAddress = new ShippingAddress({
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
      await ShippingAddress.updateMany(
        { user: userId, _id: { $ne: newShippingAddress._id } },
        { $set: { isDefault: false } }
      );
      // Establecer la nueva dirección como predeterminada
      user.defaultShippingAddress = newShippingAddress._id;
    }

    // Guardar la dirección de envío
    const savedShippingAddress = await newShippingAddress.save();

    // Actualizar las direcciones de envío del usuario
    user.shippingAddresses.push(savedShippingAddress._id);
    await user.save();

    res.status(201).json(savedShippingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la dirección de envío' });
  }
};

exports.editShippingAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId, firstName, lastName, country, mobile, addressLine1, addressLine2, postalCode, city, state, additionalInfo, isDefault } = req.body;

    console.log(req.body)
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encontrar y actualizar la dirección de envío
    const updatedShippingAddress = await ShippingAddress.findByIdAndUpdate(
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

    if (!updatedShippingAddress) {
      return res.status(404).json({ message: 'Dirección de envío no encontrada' });
    }

    // Si la dirección es predeterminada, actualizar el usuario y desactivar isDefault en otras direcciones
    if (isDefault) {
      await ShippingAddress.updateMany(
        { user: userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
      user.defaultShippingAddress = updatedShippingAddress._id;
    }

    await user.save();

    res.status(200).json(updatedShippingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al editar la dirección de envío' });
  }
};


exports.assignShippingAddressToOrder = async (req, res) => {
  try {
    const { orderId, addressId } = req.body;

console.log(req.body);

    const order = await Order.findById(orderId);
    const shippingAddress = await ShippingAddress.findById(addressId);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (!shippingAddress) {
      return res.status(404).json({ message: 'Dirección de envío no encontrada' });
    }

    order.shippingAddress = addressId;
    await order.save();

    res.status(200).json({ message: 'Dirección de envío asignada correctamente al pedido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar la dirección de envío al pedido' });
  }
};

exports.deleteShippingAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Filtrar las direcciones de envío del usuario
    user.shippingAddresses = user.shippingAddresses.filter(addr => addr.toString() !== addressId);

    // Verificar si la dirección a eliminar es la predeterminada
    if (user.defaultShippingAddress && user.defaultShippingAddress.toString() === addressId) {
      // Si hay más direcciones, establecer una nueva dirección predeterminada
      if (user.shippingAddresses.length > 0) {
        const newDefaultAddressId = user.shippingAddresses[0];
        user.defaultShippingAddress = newDefaultAddressId; // Establecer la primera dirección como la nueva predeterminada

        // Actualizar el campo isDefault de la nueva dirección predeterminada
        await ShippingAddress.findByIdAndUpdate(newDefaultAddressId, { isDefault: true });
      } else {
        user.defaultShippingAddress = null; // No hay más direcciones, establecer como null
      }
    }

    // Guardar los cambios en el usuario
    await user.save();

    // Eliminar la dirección de envío de la base de datos
    await ShippingAddress.findByIdAndDelete(addressId);

    res.status(200).json({ message: 'Dirección de envío eliminada y referencia actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la dirección de envío' });
  }
};

// Otros controladores como obtener, actualizar, eliminar dirección de envío pueden ir aquí

// ...

module.exports = exports;
