const {author: authorController} = require("../controllers");
const router = require("express").Router();
const validator = require("../middleware/validationMiddleware")

router.post("/", validator.validateCreateAuthor, authorController.createAuthor) 
router.get("/", authorController.allAuthor)   

module.exports = router;