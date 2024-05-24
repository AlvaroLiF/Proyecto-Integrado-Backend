const OrderController = require('../controllers/orderController');
const shippingController = require('../controllers/shippingController');
const paymentController = require('../controllers/paymentController');
const auth = require('../middlewares/auth');



module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get('/orders', OrderController.getOrders);
    app.get('/orders/:orderId', OrderController.getOrderById);
    app.post('/newOrder', OrderController.createOrder);
    app.delete('/user/orders/:orderId', auth.verifyToken, OrderController.deleteOrderById);
    app.post('/newShipping', shippingController.createShippingAddress);
    app.post('/newPayment', paymentController.createPaymentMethod);
    app.get('/user/:userId', auth.verifyToken, OrderController.getOrdersByUserId);
    
//app.get('/orders', authenticateUser, OrderController.getOrderHistory);
//app.post('/orders/place', authenticateUser, OrderController.placeOrder);

};