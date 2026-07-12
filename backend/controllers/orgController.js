const { DepartmentService, UserService } = require('../services/orgService');
const { success, created, paginated } = require('../utils/response');

// ─── Departments ──────────────────────────────────────────────────────────────

async function createDepartment(req, res, next) {
  try {
    const department = await DepartmentService.create(req.body, req);
    created(res, { department }, 'Department created');
  } catch (err) {
    next(err);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const department = await DepartmentService.update(req.params.id, req.body, req);
    success(res, { department }, 'Department updated');
  } catch (err) {
    next(err);
  }
}

async function listDepartments(req, res, next) {
  try {
    const { departments, pagination } = await DepartmentService.list(req.query);
    paginated(res, departments, pagination);
  } catch (err) {
    next(err);
  }
}

async function getDepartmentById(req, res, next) {
  try {
    const department = await DepartmentService.getById(req.params.id);
    success(res, { department });
  } catch (err) {
    next(err);
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function listUsers(req, res, next) {
  try {
    const { users, pagination } = await UserService.list(req.query);
    paginated(res, users, pagination);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await UserService.getById(req.params.id);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const user = await UserService.updateRole(req.params.id, req.body.role, req);
    success(res, { user }, 'User role updated');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDepartment, updateDepartment, listDepartments, getDepartmentById,
  listUsers, getUserById, updateUserRole,
};
