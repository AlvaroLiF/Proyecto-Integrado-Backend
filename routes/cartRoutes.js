const cartController = require('../controllers/cartController');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

app.post('/cart/create', cartController.createCart); // Crear un nuevo carrito
app.post('/cart/add', cartController.addToCart); // Agregar un elemento al carrito
app.get('/cart/:userId', cartController.getCart); // Obtener el carrito de un usuario
app.delete('/cart/remove/:userId/:productId', cartController.removeFromCart); // Eliminar un elemento del carrito
app.delete('/cart/remove/:userId', cartController.clearCart); // Vaciar el carrito
app.put('/update-quantity', cartController.updateCartItemQuantity);

};
