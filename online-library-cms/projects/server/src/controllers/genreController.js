const db = require("../models");

module.exports = {
  async createGenre(req, res) {
    const { name } = req.body;
    try {
      const newGenre = await db.Genre.create({ name });
      res
        .status(201)
        .send({ message: "Genre created successfully", data: newGenre });
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .send({ message: "Fatal error on server.", error: error.message });
    }
  },
  async allGenres(req, res) {
    const results = await db.Genre.findAll();
    if (results.length === 0) {
      return res.status(200).send({
        message: "No genre found",
      });
    }
    return res.status(200).send({
      message: "Genre(s) retrieved successfully",
      data: results,
    });
  },
};

