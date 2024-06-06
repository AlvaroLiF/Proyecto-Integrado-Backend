const orderController = require('../controllers/orderController');
const shippingController = require('../controllers/shippingController');
const billingController = require('../controllers/billingController');
const paymentController = require('../controllers/paymentController');
const auth = require('../middlewares/auth');



module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get('/orders', orderController.getOrders);
  app.get('/orders/:orderId', orderController.getOrderById);
  app.post('/newOrder', orderController.createOrder);
  app.delete('/user/orders/:orderId', orderController.deleteOrderById);
  app.post('/shipping-addresses', shippingController.createShippingAddress);
  app.delete('/users/:userId/shipping-addresses/:addressId', shippingController.deleteShippingAddress);
  app.put('/assign-shipping-address-to-order', shippingController.assignShippingAddressToOrder);
  app.post('/payment-methods', paymentController.createPaymentMethod);
  app.delete('/users/:userId/payment-methods/:paymentMethodId', paymentController.deletePaymentMethod);
  app.put('/assign-payment-method', paymentController.assignPaymentMethodToOrder);
  app.post('/orders/:orderId/payment/confirm', paymentController.confirmPaymentAndSendEmail);
  app.get('/user/:userId', orderController.getOrdersByUserId);
  app.post('/billing-addresses', billingController.createBillingAddress);
  app.put('/assign-billing-address-to-order', billingController.assignBillingAddressToOrder);
  app.delete('/users/:userId/billing-addresses/:addressId', billingController.deleteBillingAddress);
  app.put('/shipping-address/:addressId', shippingController.editShippingAddress);
  app.put('/payment-method/:paymentMethodId', paymentController.editPaymentMethod);
  app.put('/billing-address/:addressId', billingController.editBillingAddress);

  //app.get('/orders', authenticateUser, OrderController.getOrderHistory);
  //app.post('/orders/place', authenticateUser, OrderController.placeOrder);

};