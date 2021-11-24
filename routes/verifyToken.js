const jwt = require('jsonwebtoken');

const AppError = require('../util/appError');

/*

Error Code Status
401 = No token provided

*/

module.exports = function (req, res, next) {
  const token = req.headers['auth-token'];
  if (!token) {
    return next(new AppError('No token provided.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}