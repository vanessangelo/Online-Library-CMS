const auth = require("./authRouter");
const user = require("./userRouter");
const admin = require("./adminRouter");
const book = require("./bookRouter");
const genre = require("./genreRouter");
const author = require("./authorRouter");

module.exports = {
  auth,
  user,
  admin,
  book,
  genre,
  author
};