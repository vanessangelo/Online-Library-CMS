const db = require("../models");

module.exports = {
  async allGenres(req, res) {
    const results = await db.Genre.findAll();
    if (results.length === 0) {
      return res.status(200).send({
        message: "No genre found",
      });
    }
    return res.status(200).send({
      message: "Successfully retrieved genres",
      data: results,
    });
  },
};
