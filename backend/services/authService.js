const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');
const AuditService = require('./auditService');
const { AuthenticationError, ConflictError } = require('../errors');
const { BCRYPT_ROUNDS, JWT_EXPIRY, AUDIT_ACTIONS, ENTITY_TYPES } = require('../constants');

const AuthService = {
  signup: async ({ name, email, password, departmentId }, req) => {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email is already registered');

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserRepository.create({
      name,
      email,
      password: hashed,
      role: 'EMPLOYEE',
      departmentId: departmentId || null,
    });

    await AuditService.log({
      action: AUDIT_ACTIONS.USER_CREATED,
      entityType: ENTITY_TYPES.USER,
      entityId: user.id,
      userId: user.id,
      newValue: { name, email, role: 'EMPLOYEE' },
      req,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  login: async ({ email, password }, req) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new AuthenticationError('Invalid email or password');

    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('Account is inactive. Contact your administrator.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AuthenticationError('Invalid email or password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    await AuditService.log({
      action: AUDIT_ACTIONS.LOGIN,
      entityType: ENTITY_TYPES.USER,
      entityId: user.id,
      userId: user.id,
      req,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },
};

module.exports = AuthService;
