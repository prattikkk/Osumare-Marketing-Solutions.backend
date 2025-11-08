// Simple authentication middleware
const VALID_API_KEYS = {
  'admin-key-12345': { role: 'admin', username: 'admin' },
  'user-key-67890': { role: 'user', username: 'user1' }
};

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please provide an API key in the x-api-key header'
    });
  }

  const user = VALID_API_KEYS[apiKey];

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Attach user info to request
  req.user = user;
  next();
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize, VALID_API_KEYS };
