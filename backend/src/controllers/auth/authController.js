const registerController = require('./registerController');
const loginController = require('./loginController');
const passwordController = require('./passwordController');

module.exports = {
  ...registerController,
  ...loginController,
  ...passwordController
};
