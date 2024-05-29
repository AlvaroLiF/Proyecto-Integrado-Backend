const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config/auth-config');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Puedes usar otros servicios como 'Yahoo', 'Outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOrderConfirmation = async (to, orderDetails) => {
  const mailOptions = {
    from: 'no-reply@componentx.com',
    to: to,
    subject: 'Confirmación de pedido',
    html: `
      <div style="text-align: center;">
        <h1>Detalles del Pedido</h1>
        <h2>Número del pedido: ${orderDetails.orderNumber}</h2>
        <div style="margin: 0 auto; width: 40%;">
        ${orderDetails.items.map(item => `
        <div style="border: 2px solid black; padding: 10px; margin-bottom: 20px;">
        <p>Producto: ${item.productName}</p>
            <img src="${item.productPhoto}" alt="${item.productName}" style="max-width: 100px;">
            <p>Cantidad: ${item.quantity}</p>
            <p>Precio: ${item.price}€</p>
          </div>
        `).join('')}
        </div>
        <p>Precio Total: ${orderDetails.totalPrice}€</p>
        <p>Comprador: ${orderDetails.paymentMethod}</p>
        <p>Estado: ${orderDetails.status}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico de restablecimiento de contraseña enviado');
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
};

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `https://componentx.netlify.app/reset-password/${token}`; // Asegúrate de cambiar el enlace a la URL de tu frontend

  const mailOptions = {
    from: 'no-reply@componentx.com',
    to: email,
    subject: 'Restablecimiento de contraseña',
    html: `
      <h1>Restablecer tu contraseña</h1>
      <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el enlace de abajo para restablecer tu contraseña:</p>
      <a href="${resetLink}">Restablecer Contraseña</a>
      <p>Si no solicitaste este restablecimiento, por favor ignora este correo electrónico.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico de restablecimiento de contraseña enviado');
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
};

const generateResetToken = (user) => {
  return jwt.sign({ userId: user._id }, config.secretKey, { expiresIn: '1h' }); // Asegúrate de tener una clave secreta para tokens de restablecimiento en tu archivo de configuración
};

module.exports = {
  sendOrderConfirmation, 
  sendResetPasswordEmail,
  generateResetToken,
};
