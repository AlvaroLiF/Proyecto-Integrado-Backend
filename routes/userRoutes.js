const UserController = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middlewares/auth');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    )
    next()
  })

  app.post('/user/register', UserController.signup);
  app.post('/user/login', UserController.signin);
  app.post('/user/login-google', UserController.signInGoogle);
  app.get('/users', UserController.getUsers);
  app.get('/user/profile/:userId', UserController.viewProfile);
  app.put('/user/profile/:userId', UserController.updateUserProfile);
  app.post('/user/profile/verify-password/:userId', UserController.verifyPassword);
  app.put('/user/profile/update-password/:userId', UserController.updatePassword);
  app.post('/user/send-reset-password-email', UserController.sendResetPasswordEmail);
  app.post('/user/reset-password', UserController.resetPassword);
  app.patch('/users/:userId/addAdminRole', UserController.addAdminRole);
  app.patch('/users/:userId/removeAdminRole', UserController.removeAdminRole);
  app.delete('/users/:userId', UserController.deleteUser);
  app.get('/users/:userId/shipping-addresses', UserController.getUserShippingAddresses);
  app.get('/users/:userId/payment-methods', UserController.getUserPaymentMethods);
  app.get('/users/:userId/billing-addresses', UserController.getUserBillingAddresses);

};