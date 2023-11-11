const OrderController = require('../controllers/orderController');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get('/orders', OrderController.getOrders);
    app.post('/orders/place', OrderController.createOrder);

//app.get('/orders', authenticateUser, OrderController.getOrderHistory);
//app.post('/orders/place', authenticateUser, OrderController.placeOrder);

};