const AuthService = require('../services/authService');
const { success, created } = require('../utils/response');

async function signup(req, res, next) {
  try {
    const user = await AuthService.signup(req.body, req);
    created(res, { user }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await AuthService.login(req.body, req);
    success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await AuthService.me(req);
    success(res, result, 'Authenticated user profile loaded');
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me };
