const router = require('express').Router();
const ctrl = require('../controllers/orgController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const v = require('../validators/departmentValidators');
const { ROLES } = require('../constants');

const admins = [ROLES.ADMIN];
const managers = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

// Departments
router.post('/departments', auth, authorize(...admins), v.create, validate, ctrl.createDepartment);
router.get('/departments', auth, ctrl.listDepartments);
router.get('/departments/:id', auth, ctrl.getDepartmentById);
router.patch('/departments/:id', auth, authorize(...admins), v.update, validate, ctrl.updateDepartment);

// Users
router.get('/users', auth, authorize(...managers), ctrl.listUsers);
router.get('/users/:id', auth, ctrl.getUserById);
router.patch('/users/:id/role', auth, authorize(...admins), v.updateUserRole, validate, ctrl.updateUserRole);

module.exports = router;
