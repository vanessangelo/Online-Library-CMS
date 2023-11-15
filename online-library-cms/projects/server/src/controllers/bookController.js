const {
  setFromFileNameToDBValueBookCover,
  getFileNameFromDbValue,
  getAbsolutePathPublicFileBookCover,
} = require("../helpers/fileConverter");
const db = require("../models");
const fs = require("fs");

module.exports = {
  async createBook(req, res) {
    const {
      title,
      description,
      page,
      ISBN,
      publicationYear,
      quantityTotal,
      genreId,
      authorId,
    } = req.body;
    const imgFileName = req.file ? req.file.filename : null;
    const transaction = await db.sequelize.transaction();
    try {
      const formattedPublicationYear = new Date(`${publicationYear}-01-01`);
      const isExist = await db.Book.findOne({
        where: {
          title,
          publicationYear: formattedPublicationYear,
          authorId,
        },
        transaction,
      });

      if (isExist) {
        await transaction.rollback();
        return res.status(400).send({ message: "Book already exist" });
      }

      const newBook = await db.Book.create(
        {
          title,
          description,
          page,
          ISBN,
          publicationYear: formattedPublicationYear,
          quantityTotal,
          quantityAvailable: quantityTotal,
          isActive: true,
          genreId: parseInt(genreId),
          authorId: parseInt(authorId),
          imgCover: setFromFileNameToDBValueBookCover(imgFileName),
        },
        { transaction }
      );

      await transaction.commit();

      return res
        .status(201)
        .send({ message: "Book created successfully", data: newBook });
    } catch (error) {
      console.log(error.message);
      await transaction.rollback();
      res
        .status(500)
        .send({ message: "Fatal error on server.", error: error.message });
    }
  },
  async allBook(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 8,
      search: req.query.search || "",
      genre: req.query.filterGenre || "",
      publicationYear: req.query.sortPublicationYear,
    };

    try {
      const where = {};
      let order = [["createdAt", "DESC"]];

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          { title: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          {
            "$Author.name$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
        ];
      }
      if (pagination.genre) {
        where.genreId = pagination.genre;
      }
      if (pagination.publicationYear) {
        order = [];
        if (pagination.publicationYear.toUpperCase() === "DESC") {
          order.push(["publicationYear", "DESC"]);
        } else {
          order.push(["publicationYear", "ASC"]);
        }
      }

      const results = await db.Book.findAndCountAll({
        where,
        include: [
          {
            model: db.Genre,
          },
          {
            model: db.Author,
          },
        ],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
        order,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No books found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved books",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  async allActiveBook(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 8,
      search: req.query.search || "",
      genre: req.query.filterGenre || "",
      publicationYear: req.query.sortPublicationYear,
    };

    try {
      const where = { isActive: true };
      let order = [["createdAt", "DESC"]];

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          { title: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          {
            "$Author.name$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
        ];
      }
      if (pagination.genre) {
        where.genreId = pagination.genre;
      }
      if (pagination.publicationYear) {
        order = [];
        if (pagination.publicationYear.toUpperCase() === "DESC") {
          order.push(["publicationYear", "DESC"]);
        } else {
          order.push(["publicationYear", "ASC"]);
        }
      }

      const results = await db.Book.findAndCountAll({
        where,
        include: [
          {
            model: db.Genre,
          },
          {
            model: db.Author,
          },
        ],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
        order,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No books found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved books",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  async bookById(req, res) {
    try {
      const book = await db.Book.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          {
            model: db.Genre,
          },
          {
            model: db.Author,
          },
        ],
      });

      if (!book) {
        return res.status(404).send({
          message: "Book not found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved book",
        data: book,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  async updateBook(req, res) {
    const transaction = await db.sequelize.transaction();
    const {
      title,
      description,
      page,
      ISBN,
      publicationYear,
      quantityTotal,
      genreId,
      authorId,
    } = req.body;

    try {
      const getBook = await db.Book.findOne({
        where: {
          id: parseInt(req.params.id),
        },
      });

      if (!getBook) {
        await transaction.rollback();
        return res.status(404).send({
          message: "Book not found",
        });
      }

      if (title || publicationYear || authorId) {
        const isExist = await db.Book.findOne({
          where: {
            title,
            publicationYear: new Date(`${publicationYear}-01-01`),
            authorId: parseInt(authorId),
          },
        });
        if (isExist) {
          await transaction.rollback();
          return res
            .status(400)
            .send({ message: "Similar book already exist" });
        } else {
          getBook.title = title;
          getBook.publicationYear = new Date(`${publicationYear}-01-01`);
          getBook.authorId = parseInt(authorId);
        }
      }
      if (req.file) {
        const realimgProduct = getBook.getDataValue("imgCover");
        const oldFilename = getFileNameFromDbValue(realimgProduct);
        if (oldFilename) {
          fs.unlinkSync(getAbsolutePathPublicFileBookCover(oldFilename));
        }
        getBook.imgCover = setFromFileNameToDBValueBookCover(req.file.filename);
      }
      if (description) {
        getBook.description = description;
      }
      if (page) {
        getBook.page = page;
      }
      if (ISBN) {
        getBook.ISBN = ISBN;
      }
      if (quantityTotal) {
        const gap = quantityTotal - getBook.quantityTotal;
        getBook.quantityTotal = quantityTotal;
        getBook.quantityAvailable += gap;
      }
      if (genreId) {
        getBook.genreId = parseInt(genreId);
      }

      await getBook.save({ transaction });

      await transaction.commit();
      return res.status(200).send({
        message: "Sucessfully changed book details",
        data: getBook,
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
};
