'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Book.belongsTo(models.Author, {foreignKey: "authorId"});
      Book.belongsTo(models.Genre, {foreignKey: "genreId"});
      Book.belongsToMany(models.User, {
        through: models.Borrow_History,
        foreignKey: "bookId",
        otherKey: "userId",
      })
    }
  }
  Book.init({
    title: DataTypes.STRING,
    imgCover: DataTypes.STRING,
    description: DataTypes.STRING,
    page: DataTypes.INTEGER,
    ISBN: DataTypes.STRING,
    publicationYear: DataTypes.DATE,
    quantityTotal: DataTypes.INTEGER,
    quantityAvailable: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN,
    genreId: DataTypes.INTEGER,
    authorId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};