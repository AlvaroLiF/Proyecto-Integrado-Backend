const CategoryController = require('../controllers/categoryController');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

app.get('/categories', CategoryController.getCategories);
//app.get('/categories/:categoryId', CategoryController.getCategoryDetails);
app.post('/categories', CategoryController.createCategory);
//app.put('/categories/:categoryId', CategoryController.updateCategory);
//app.delete('/categories/:categoryId', CategoryController.deleteCategory);

};
