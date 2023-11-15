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
};
