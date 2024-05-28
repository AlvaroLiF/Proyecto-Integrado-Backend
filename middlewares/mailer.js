const nodemailer = require('nodemailer');

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

const sendOrderConfirmation = (to, orderDetails) => {
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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
};

module.exports = { sendOrderConfirmation };
