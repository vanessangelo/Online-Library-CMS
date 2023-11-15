const router = require("express").Router();
const {book: bookController} = require("../controllers");
const validator = require("../middleware/validationMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const bookMulterMiddleware = require("../middleware/multerMiddleware");

router.use(authMiddleware.verifyToken)

router.get("/", bookController.allBook)
router.get("/active", bookController.allActiveBook)
router.post("/", authMiddleware.verifyAdmin, bookMulterMiddleware, validator.validateCreateBook, bookController.createBook)
router.get("/:id", bookController.bookById)
router.patch("/:id", authMiddleware.verifyAdmin, bookMulterMiddleware, validator.validateUpdateBook, bookController.updateBook)

module.exports = router;
