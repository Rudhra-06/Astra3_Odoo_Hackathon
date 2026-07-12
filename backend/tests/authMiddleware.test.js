const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const { AuthenticationError } = require('../errors');

process.env.JWT_SECRET = 'test-secret';

test('rejects requests without a bearer token', (t) => {
  const req = { headers: {} };
  const res = {};
  let nextCalledWith = null;

  authMiddleware(req, res, (err) => {
    nextCalledWith = err;
  });

  assert.ok(nextCalledWith instanceof AuthenticationError);
  assert.equal(nextCalledWith.message, 'No token provided');
});

test('rejects expired tokens with a session-expired message', (t) => {
  const token = jwt.sign({ id: 1, email: 'user@example.com', role: 'EMPLOYEE' }, process.env.JWT_SECRET, { expiresIn: -1 });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = {};
  let nextCalledWith = null;

  authMiddleware(req, res, (err) => {
    nextCalledWith = err;
  });

  assert.ok(nextCalledWith instanceof AuthenticationError);
  assert.equal(nextCalledWith.message, 'Session expired. Please log in again.');
});

test('attaches the decoded user to the request for valid tokens', (t) => {
  const token = jwt.sign({ id: 1, email: 'user@example.com', role: 'EMPLOYEE' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = {};
  let nextCalledWith = null;

  authMiddleware(req, res, (err) => {
    nextCalledWith = err;
  });

  assert.equal(nextCalledWith, undefined);
  assert.equal(req.user.id, 1);
  assert.equal(req.user.email, 'user@example.com');
  assert.equal(req.user.role, 'EMPLOYEE');
});
