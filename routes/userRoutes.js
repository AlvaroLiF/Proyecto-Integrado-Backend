const UserController = require('../controllers/userController');

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
app.get('/user/username', UserController.getUsername);
app.get('/users', UserController.getUsers);
app.patch('/users/:userId/addAdminRole', UserController.addAdminRole);
app.patch('/users/:userId/removeAdminRole', UserController.removeAdminRole);
app.delete('/users/:userId', UserController.deleteUser);

};