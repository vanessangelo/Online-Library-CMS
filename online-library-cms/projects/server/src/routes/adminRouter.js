const router = require("express").Router();
const {admin: adminController} = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.verifyToken)

router.patch("/borrow-histories/:id/:action", authMiddleware.verifyAdmin, adminController.requestApproval)
router.get("/borrow-histories", authMiddleware.verifyAdmin, adminController.getBorrowHistory)
router.get("/users", authMiddleware.verifyAdmin, adminController.getAllUser)

module.exports = router;
