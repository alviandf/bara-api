const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers['auth-token'];
  if (!token) {
    return res.status(401).send({ auth: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }
}