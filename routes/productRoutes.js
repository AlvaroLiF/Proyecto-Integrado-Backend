const ProductController = require('../controllers/productController');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

app.get('/products', ProductController.getProducts);
app.get('/featured', ProductController.getFeaturedProducts);
app.get('/products/:productId', ProductController.getProductDetails);
app.get('/search', ProductController.searchProducts);
app.post('/product/add', ProductController.createProduct);
app.put('/products/:productId', ProductController.updateProduct);
app.delete('/products/:productId', ProductController.deleteProduct);

};
