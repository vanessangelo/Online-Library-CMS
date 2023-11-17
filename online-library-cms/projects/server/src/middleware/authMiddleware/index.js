const jwt = require("jsonwebtoken");

module.exports = {
  async verifyToken(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).send({
        message: "Token is not found",
      });
      return;
    }

    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!payload) {
          res.status(401).send({
            message: "token verification failed",
          });
          return;
        }
        req.user = payload;
        next();
      } catch (error) {
        if (error.name === "JsonWebTokenError") {
          return res.status(401).send({
            message: "Invalid token",
            error: error.message,
          });
        } else if (error.name === "TokenExpiredError") {
          return res.status(401).send({
            message: "Token has expired",
            error: error.message,
          });
        } else {
          console.error("JWT Verification Error:", error);
          return res.status(401).send({
            message: "Token verification failed",
            error: error.message,
          });
        }
      }
    } else {
      return res.status(401).send({
        message: "Invalid token format",
      });
    }
  },

  async verifyAdmin(req, res, next) {
    console.log("kena verifyAdmin")
    if (req.user.role === "admin") {
      return next();
    }
    res.status(401).send({
      message: "role is not allowed to access",
    });
  },

  async verifyUser(req, res, next) {
    console.log("kena verifyUser")
    if (req.user.role === "user") {
      return next();
    }
    res.status(401).send({
      message: "role is not allowed to access",
    });
  },
};
