const UserController = require('../controllers/userController');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

app.post('/register', UserController.createUser);
app.post('/login', UserController.loginUser);

};