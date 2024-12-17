const {verify} = require("jsonwebtoken")
const optionalAuth = (req, res, next) => {
    const token = req.header("accessToken");
    if (!token) {
      req.user = null;
      return next();
    }
  
    try {
      const validToken = verify(token, "secret"); // Замените на ваш секрет
      req.user = validToken;
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  };
  module.exports = {optionalAuth};