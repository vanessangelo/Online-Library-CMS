const {auth: authController, auth} = require("../controllers");
const router = require("express").Router();
const validator = require("../middleware/validationMiddleware")

router.post("/login", validator.validateLogin, authController.login)
router.post("/register", validator.validateRegisterUser, authController.register)

module.exports = router;