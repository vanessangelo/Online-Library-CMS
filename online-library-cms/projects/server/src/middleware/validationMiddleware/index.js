const { body, validationResult } = require("express-validator");
const db = require("../../models");

const allowedEmailDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
];

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res
      .status(400)
      .send({ message: "An error occurs", errors: errors.array() });
  };
};

const checkEmailUnique = async (value, { req }) => {
  try {
    const user = await db.User.findOne({ where: { email: value } });
    if (user) {
      throw new Error("Email already taken");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkUsernameUnique = async (value, { req }) => {
  try {
    const user = await db.User.findOne({ where: { username: value } });
    if (user) {
      throw new Error("Username already taken");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkAuthorUnique = async (value, { req }) => {
  try {
    const author = await db.Author.findOne({ where: { name: value } });
    if (author) {
      throw new Error("Author already exist");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkGenreUnique = async (value, { req }) => {
  try {
    const genre = await db.Genre.findOne({ where: { name: value } });
    if (genre) {
      throw new Error("Genre already exist");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkValidGenre = async (value, { req }) => {
  try {
    const genre = await db.Genre.findOne({
      where: { id: value },
    });
    if (!genre) {
      throw new Error("Selected genre not found");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkValidAuthor = async (value, { req }) => {
  try {
    const author = await db.Author.findOne({
      where: { id: value },
    });
    if (!author) {
      throw new Error("Selected author not found");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkValidGenreOptional = async (value, { req }) => {
  try {
    if (value) {
      const genre = await db.Genre.findOne({
        where: { id: value },
      });
      if (!genre) {
        throw new Error("Selected genre not found");
      }
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkValidAuthorOptional = async (value, { req }) => {
  try {
    if (value) {
      const author = await db.Author.findOne({
        where: { id: value },
      });
      if (!author) {
        throw new Error("Selected author not found");
      }
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  validateLogin: validate([
    body("credential").notEmpty().withMessage("Email or username is required"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Minimum password length is 8 characters"),
  ]),

  validateRegisterUser: validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50")
      .custom(checkUsernameUnique),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email format is required")
      .custom((value) => {
        const domain = value.split("@")[1];
        if (!domain || !allowedEmailDomains.includes(domain)) {
          throw new Error(
            "Allowed domains are: Gmail, Outlook, Yahoo, Hotmail"
          );
        }
        return true;
      })
      .custom(checkEmailUnique),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
      .withMessage(
        "Password must be at least 8 char, 1 uppercase, 1 number and no symbols"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirm_password) {
          throw new Error("Confirm password does not match with password");
        }
        return true;
      }),
    body("confirm_password")
      .notEmpty()
      .withMessage("Confirm password is required")
      .isLength({ min: 8 })
      .withMessage("Minimum confirm password length is 8 characters"),
  ]),

  validateCreateAuthor: validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50")
      .custom(checkAuthorUnique),
  ]),

  validateCreateGenre: validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50")
      .custom(checkGenreUnique),
  ]),

  validateCreateBook: validate([
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 200 })
      .withMessage("Maximum character is 200"),
    body("page")
      .trim()
      .notEmpty()
      .withMessage("Page is required")
      .isInt({
        gt: 0,
        lt: 2001,
      })
      .withMessage("Page must be a valid number and not exceed 2000"),
    body("ISBN")
      .trim()
      .notEmpty()
      .withMessage("ISBN is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("publicationYear")
      .trim()
      .notEmpty()
      .withMessage("Pulication year is required")
      .isInt({
        gt: 1000,
        lt: new Date().getFullYear() + 1,
      })
      .withMessage("Invalid publication year"),
    body("quantityTotal")
      .trim()
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({
        gt: 0,
        lt: 11,
      })
      .withMessage("Quantity must be a valid number and not exceed 10"),
    body("genreId")
      .notEmpty()
      .withMessage("Genre is required")
      .custom(checkValidGenre),
    body("authorId")
      .notEmpty()
      .withMessage("Author is required")
      .custom(checkValidAuthor),
  ]),

  validateUpdateBook: validate([
    body("title")
      .trim()
      .optional()
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("description")
      .trim()
      .optional()
      .isLength({ max: 200 })
      .withMessage("Maximum character is 200"),
    body("page")
      .trim()
      .optional()
      .custom((value, { req }) => {
        if (
          value !== "" &&
          (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 2001)
        ) {
          throw new Error("Page must be a valid number and not exceed 2000");
        }
        return true;
      }),
    body("ISBN")
      .trim()
      .optional()
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("publicationYear")
      .trim()
      .optional()
      .custom((value, { req }) => {
        if (
          value !== "" &&
          (isNaN(value) ||
            parseInt(value) < 1000 ||
            parseInt(value) > new Date().getFullYear() + 1)
        ) {
          throw new Error("Invalid publication year");
        }
        return true;
      }),
    body("quantityTotal")
      .trim()
      .optional()
      .custom(async (value, { req }) => {
        if (value) {
          const existingBook = await db.Book.findByPk(req.params.id);
          if (existingBook) {
            const total = parseInt(value);
            const minimumQuantity =
              existingBook.quantityTotal - existingBook.quantityAvailable;
            if (isNaN(total) || total < minimumQuantity || total <= 0) {
              throw new Error(
                `Quantity must be a valid number and not less than ${minimumQuantity}`
              );
            }
          }
        }
        return true;
      }),
    body("genreId").optional().custom(checkValidGenreOptional),
    body("authorId").optional().custom(checkValidAuthorOptional),
  ]),
};
