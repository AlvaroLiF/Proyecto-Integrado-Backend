const UserController = require('../controllers/userController');
const authenticateUser = require('../middlewares/auth');

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      )
      next()
    })

app.post('/user/register', UserController.signup);
app.post('/user/login', UserController.signin);
app.get('/user/username', authenticateUser, UserController.getUsername);

};