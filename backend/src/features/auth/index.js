const registerController = require('./register.controller');
const loginController = require('./login.controller');
const passwordController = require('./password.controller');

module.exports = {
  ...registerController,
  ...loginController,
  ...passwordController
};
