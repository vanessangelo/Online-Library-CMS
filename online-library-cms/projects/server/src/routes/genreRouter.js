const router = require("express").Router();
const {genre: genreController} = require("../controllers")
const validator = require("../middleware/validationMiddleware")

router.get("/", genreController.allGenres)
router.post("/", validator.validateCreateGenre, genreController.createGenre)

module.exports = router;
