const db = require("../models");

module.exports = {
  async createAuthor(req, res) {
    const { name } = req.body;
    try {
      const newAuthor = await db.Author.create({ name });
      res
        .status(201)
        .send({ message: "Author created successfully", data: newAuthor });
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .send({ message: "Fatal error on server.", error: error.message });
    }
  },
  async allAuthor(req, res) {
    try {
      const result = await db.Author.findAll({
        order: [
          ['name', 'ASC']
        ]
      })
      res
        .status(200)
        .send({ message: "Author(s) retrieved successfully", data: result });
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .send({ message: "Fatal error on server.", error: error.message });
    }
  },
};
