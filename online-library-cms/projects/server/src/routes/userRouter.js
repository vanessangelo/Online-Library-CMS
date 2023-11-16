const router = require("express").Router();
const { user: userController } = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.verifyToken);

router.get("/profile", userController.getProfile);
router.get(
  "/borrow-histories",
  authMiddleware.verifyUser,
  userController.getBorrowHistory
);
router.get(
  "/borrow-histories/active",
  authMiddleware.verifyUser,
  userController.getOneBorrowingBook
);
router.post(
  "/books/:id",
  authMiddleware.verifyUser,
  userController.borrowRequest
);
router.patch(
  "/borrow-histories/:id",
  authMiddleware.verifyUser,
  userController.returnRequest
);

module.exports = router;
