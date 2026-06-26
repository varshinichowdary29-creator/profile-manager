const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'intellitots_super_secret_jwt_key_2026');

      // Get user from the token, exclude password
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User no longer exists.' });
      }

      if (req.user.status === 'Inactive') {
        return res.status(403).json({ success: false, message: 'Account is deactivated.' });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware] Token validation error:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token.' });
  }
};

const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource.`
      });
    }

    next();
  };
};

module.exports = { protect, checkRole };
