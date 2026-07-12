const router = require('express').Router();
const { signup, login, me } = require('../controllers/authController');
const { signup: signupRules, login: loginRules } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new employee account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               departmentId: { type: integer }
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 *       422: { description: Validation error }
 */
router.post('/signup', signupRules, validate, signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginRules, validate, login);
router.get('/me', auth, me);

module.exports = router;
