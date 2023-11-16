const db = require("../models");

const handleBorrowApproval = async (id, transaction, res) => {
  try {
    const getBorrowHistory = await db.Borrow_History.findOne({
      where: {
        id,
        status: "Queued",
      },
      transaction,
    });

    if (!getBorrowHistory) {
      await transaction.rollback();
      return res.status(400).send({
        message: "Borrow history not found",
      });
    }

    getBorrowHistory.status = "Borrowed";
    getBorrowHistory.issuedDate = new Date();

    await getBorrowHistory.save({ transaction });

    await transaction.commit();

    res.status(200).send({
      message: "Approved borrow requested successfully",
      data: getBorrowHistory,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};
const handleReturnApproval = async (id, transaction, res) => {
  try {
    const getBorrowHistory = await db.Borrow_History.findOne({
      where: {
        id,
        status: "Pending",
      },
      transaction,
    });

    if (!getBorrowHistory) {
      await transaction.rollback();
      return res.status(400).send({
        message: "Borrow history not found",
      });
    }

    getBorrowHistory.status = "Returned";
    getBorrowHistory.returnedDate = new Date();

    await getBorrowHistory.save({ transaction });

    const getBook = await db.Book.findOne({
      where: {
        id: getBorrowHistory.bookId,
      },
    });

    if (!getBook) {
      await transaction.rollback();
      return res.status(400).send({
        message: "Associated book not found",
      });
    }

    getBook.quantityAvailable += 1;

    await getBook.save({ transaction });

    await transaction.commit();

    res.status(200).send({
      message: "Approved borrow requested successfully",
      data: getBorrowHistory,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  async requestApproval(req, res) {
    const transaction = await db.sequelize.transaction();
    const { id, action } = req.params;
    try {
      switch (action) {
        case "approveBorrow":
          await handleBorrowApproval(id, transaction, res);
          break;

        case "approveReturn":
          await handleReturnApproval(id, transaction, res);
          break;

        default:
          await transaction.rollback();
          return res.status(400).send({
            message: "Invalid action",
          });
      }
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
      user: req.query.filterUser || "",
      status: req.query.status
        ? req.query.status.split(",")
        : ["Queued", "Borrowed", "Pending", "Returned"],
    };

    try {
      const where = {};

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {
            "$Book.title$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
          {
            "$Book.Author.name$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
        ];
      }
      if (pagination.genre) {
        where["$Book.genreId$"] = pagination.genre;
      }
      if (pagination.user) {
        where.userId = pagination.user;
      }
      if (pagination.status) {
        where.status = { [db.Sequelize.Op.in]: pagination.status };
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
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      // if (results.rows.length === 0) {
      //   return res.status(200).send({
      //     message: "No borrow history(s) found",
      //   });
      // }

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
};
