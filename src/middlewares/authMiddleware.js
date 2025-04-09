const { verifyToken } = require('../config/jwt');
const ApiError = require('../utils/apiError');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new ApiError(401, 'Invalid token or user doesn\'t exist'));
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    next(error);
  }
};

module.exports = authMiddleware;