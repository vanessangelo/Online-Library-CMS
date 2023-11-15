const router = require("express").Router();
const {genre: genreController} = require("../controllers")

router.get("/all-genre", genreController.allGenres)

module.exports = router;
