require("dotenv").config();
const bcrypt = require("bcrypt");
const axios = require("axios");

const { ZIP_API_KEY } = process.env;

module.exports = {
  register: async (req, res) => {
    const db = req.app.get("db");
    const { password, email, zip } = req.body;

    const coordinates = await axios
      .get(
        `https://www.zipcodeapi.com/rest/${ZIP_API_KEY}/info.json/${zip}/degrees`
      )
      .catch((err) =>
        console.log(
          err,
          "ACTION FAILED: Could not retrieve a latitude and longitude"
        )
      );

    const { lat, lng } = coordinates.data;

    const [foundUser] = await db.select_user(email);

    if (foundUser) {
      return res.status(409).send({ error: "That email is already registered" });
    }
    if (!password) {
      return res.status(409).send({ error: "Enter a password" });
    }
    if (!zip) {
        return res.status(409).send({ error: "Enter a zipcode"})
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);
    const [newUser] = await db.create_user([hash, email]);
    const [profile] = await db.create_profile([newUser.user_id, zip, lat, lng]);

    delete profile.password;
    req.session.user = profile;

    res.status(200).send(req.session.user);
  },

  login: async (req, res) => {
    const db = req.app.get("db");
    const { password, email } = req.body;

    const [foundUser] = await db
      .select_user(email)
      .catch((err) =>
        console.log(err, "A user tried to login with an unregistered email")
      );

    if (!foundUser) {
      return res.status(401).send({ message: "That username/password does not exist" });
    }
    const authenticated = await bcrypt.compareSync(
      password,
      foundUser.password
    );

    if (authenticated) {
      delete foundUser.password;
      req.session.user = foundUser;
      console.log("-> Login Detected <-");
      res.status(200).send(req.session.user);
    } else {
      console.log("!!! FAILED LOGIN DETECTED !!!");
      res.status(401).send({ message: "That username/password does not exist" });
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    console.log("<- Logout Detected ->");
    res.status(200).send({ success: "Successfully logged out" });
  },

  getSession: (req, res) => {
    if (req.session.user) {
      res.status(200).send(req.session.user);
    } else {
      res.status(409).send({ error: "No user found" });
    }
  },
};
