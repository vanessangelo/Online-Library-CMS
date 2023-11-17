const db = require("../models");

module.exports = {
  async getProfile(req, res) {
    try {
      const myProfile = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        attributes: {
          exclude: ["password"],
        },
      });

      if (!myProfile) {
        return res.status(404).send({
          message: "Profile not found",
        });
      }

      res
        .status(200)
        .send({ message: "Profile retrieved successfully", data: myProfile });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async borrowRequest(req, res) {
    const transaction = await db.sequelize.transaction();
    const { id } = req.params;
    try {
      const isBorrowing = await db.Borrow_History.findOne({
        where: {
          bookId: id,
          userId: req.user.id,
          returnedDate: null,
        },
      });

      if (isBorrowing) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Please return the current book before borrowing another",
        });
      }

      const getBook = await db.Book.findOne({
        where: {
          id,
        },
        transaction,
      });

      if (!getBook) {
        await transaction.rollback();
        return res.status(404).send({ message: "Book not found" });
      }

      if (getBook.quantityAvailable <= 0) {
        await transaction.rollback();
        return res
          .status(400)
          .send({ message: "Book not available for borrowing" });
      }

      getBook.quantityAvailable -= 1;

      await getBook.save({ transaction });

      const newBorrowHistory = await db.Borrow_History.create(
        {
          userId: req.user.id,
          bookId: id,
          issuedDate: new Date(),
          status: "Queued",
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).send({
        message: "Borrow requested successfully",
        data: newBorrowHistory,
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async returnRequest(req, res) {
    const transaction = await db.sequelize.transaction();
    const { id } = req.params;
    try {
      const getBorrowHistory = await db.Borrow_History.findOne({
        where: {
          id,
          userId: req.user.id,
          status: "Borrowed",
        },
        transaction,
      });

      if (!getBorrowHistory) {
        await transaction.rollback();
        return res.status(404).send({ message: "Borrow history not found" });
      }

      getBorrowHistory.status = "Pending";

      await getBorrowHistory.save({ transaction });

      await transaction.commit();

      res.status(200).send({
        message: "Return requested successfully",
        data: getBorrowHistory,
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async getBorrowHistory(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 8,
      search: req.query.search || "",
      genre: req.query.filterGenre || "",
    };

    try {
      const where = { userId: req.user.id };

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {"$Book.title$": { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          {
            "$Book.Author.name$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
        ];
      }
      if (pagination.genre) {
        where['$Book.genreId$'] = pagination.genre
      }

      const results = await db.Borrow_History.findAndCountAll({
        where,
        include: [
          {
            model: db.Book,
            include: [
              {
                model: db.Author,
              },
              {
                model: db.Genre,
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No borrow history(s) found",
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
  async getOneBorrowingBook(req, res) {
    try {
      const getBorrowingBook = await db.Borrow_History.findOne({
        where: {
          userId: req.user.id,
          status: {
            [db.Sequelize.Op.or]: ["Queued", "Borrowed", "Pending"],
          },
        },
        attributes: ["id", "userId", "bookId", "issuedDate", "returnedDate", "status"],
        include: [
          {
            model: db.Book,
            include: [
              {
                model: db.Author,
              },
              {
                model: db.Genre,
              },
            ],
          },
        ],
      });

      res.status(200).send({
        message: "Succcessfully retrieved ongoing book",
        data: getBorrowingBook || {},
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};
