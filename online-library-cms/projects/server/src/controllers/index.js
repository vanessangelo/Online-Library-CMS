const auth = require("./authController");
const book = require("./bookController");
const admin = require("./adminController");
const user = require("./userController");
const genre = require("./genreController");

module.exports = {
  auth,
  book,
  admin,
  user,
  genre,
};
