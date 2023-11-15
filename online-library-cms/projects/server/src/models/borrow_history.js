'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Borrow_History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Borrow_History.belongsTo(models.User, { foreignKey: "userId" });
      Borrow_History.belongsTo(models.Book, { foreignKey: "bookId" });
    }
  }
  Borrow_History.init({
    userId: DataTypes.INTEGER,
    bookId: DataTypes.INTEGER,
    issuedDate: DataTypes.DATE,
    returnedDate: DataTypes.DATE,
    status: DataTypes.ENUM("Queued", "Borrowed", "Pending", "Returned")
  }, {
    sequelize,
    modelName: 'Borrow_History',
  });
  return Borrow_History;
};