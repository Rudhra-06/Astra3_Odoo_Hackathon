const { HTTP } = require('../constants');

const success = (res, data = {}, message = 'Success', statusCode = HTTP.OK) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created successfully') =>
  success(res, data, message, HTTP.CREATED);

const noContent = (res) => res.status(HTTP.NO_CONTENT).send();

const paginated = (res, data, pagination, message = 'Success') =>
  res.status(HTTP.OK).json({ success: true, message, data, pagination });

module.exports = { success, created, noContent, paginated };
