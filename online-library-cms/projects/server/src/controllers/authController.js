const bcrypt = require("bcryptjs");
const db = require("../models");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const hbs = require("handlebars");
const nodemailer = require("nodemailer");
const {join} = require("path");

const transporter = nodemailer.createTransport({
  service: process.env.MY_SERVICE,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASS,
  },
});

module.exports = {
  async login(req, res) {
    console.log("ini data masuk server", req.body)
    try {
      const { credential, password } = req.body;

      const user = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { email: credential },
            { username: credential },
          ],
        },
      });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const isPassMatch = await bcrypt.compare(password, user.password);

      if (isPassMatch) {
        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "10d",
          }
        );
        return res
          .status(200)
          .send({ message: "Successful login", user: {name: user.name, email: user.email, username: user.username, role: user.role}, accessToken: token });
      } else {
        return res.status(400).send({ message: "Invalid credential" });
      }
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .send({ message: "Fatal error on server.", error: error.message });
    }
  },
  async register(req, res) {
    const { name, username, email, password } = req.body;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = await db.User.create({
        name,
        username,
        email,
        role: "user",
        password: hashPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const template = fs.readFileSync(join(__dirname, '..', 'helpers', 'template', 'register.html'), "utf-8");
      const templateCompile = hbs.compile(template);
      const htmlResult = templateCompile({ name });

      const nodemailerEmail = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Thank you for your registration!",
        html: htmlResult,
      };

      transporter.sendMail(nodemailerEmail, (error, info) => {
        if (error) {
          return res.status(500).json({ error: "Error sending email" });
        } else {
          return res.status(201).send({
            message: "Registration success!",
            data: {
              username: newUser.username,
              email: newUser.email,
              phone: newUser.phone,
            },
          });
        }
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ message: "Fatal error on server.", error: error.message });
    }
  },
};
