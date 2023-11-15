"use strict";

const bcrypt = require("bcryptjs");

const generatePassword = async (PW) => {
  let salt = await bcrypt.genSalt(10);
  let hashed = await bcrypt.hash(PW, salt);
  return hashed;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const pw = await generatePassword("!Password1");
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Admin",
          email: "admin@gmail.com",
          username: "admin_library",
          password: pw,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "User1",
          email: "mockuser1@gmail.com",
          username: "user_one",
          password: pw,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {});
  },
};
