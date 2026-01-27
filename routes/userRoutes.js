const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");
const sendMail = require("../utils/sendMail");

const userRouter = require("express").Router();

userRouter.get("/", (req, res) => {
  res.status(200).send("Bienvenue!");
});

userRouter.get("/me", auth, async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
});

// Création de compte
userRouter.post("/logup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      res.status(409).json("Cet utilisateur existe déjà!");
    } else {
      const hashedPassword = bcrypt.hash(password, 10, function (err, hashed) {
        if (err) {
          res.status(500).json("Une erreur est survenue!");
        } else {
          User.create({ email: email, password: hashed });
        }
      });

      res.status(200).json("Utilisateur créer avec succès!");
    }
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

// Connexion
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      res.status(409).json("Cet utilisateur n'existe pas!");
    } else {
      const isSame = bcrypt.compare(
        password,
        findUser.password,
        (err, result) => {
          if (result) {
            const authToken = jwt.sign(
              { _id: findUser._id, email: email },
              process.env.SECRET_TOKEN,
              { expiresIn: "1h" }
            );
            findUser.authTokens[0] = { authToken };
            findUser.save();
            res.cookie("token", authToken, {
              httpOnly: true, // protège contre accès JS
              secure: true, // en dev = false, en prod = true avec HTTPS
              sameSite: "none", // none si en production et lax en dev
            });
            res.status(200).json(findUser);
          } else {
            res.status(401).json("Mot de passe incorrect!");
          }
        }
      );
    }
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

userRouter.post("/logout", auth, async (req, res) => {
  res.clearCookie("token");
  res.status(200).json("déconnecter");
});

// Modification de compte
userRouter.post("/update-account", auth, async (req, res) => {
  const { password, newPassword, passwordConfirm } = req.body;
  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(req.user._id),
  });
  try {
    const isSame = bcrypt.compare(password, user.password);
    if (isSame === true) {
      const hashedPassword = bcrypt.hash(
        newPassword,
        10,
        function (err, hashed) {
          if (err) {
            res.status(500).json("Une erreur est survenue!");
          } else {
            user.password = hashed;
            user.save();
            res.status(200).json(isSame,user);
          }
        }
      );
    } else {
      res.status(401).json("Mot de passe incorrect!");
    }
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

// Mot de passe oublié
userRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      const authToken = jwt.sign(
        { _id: findUser._id, email: email },
        process.env.PASSWORD_SECRET_TOKEN,
        { expiresIn: "1h" }
      );
      findUser.authTokens[0] = { authToken };
      findUser.save();
      const link = `http://localhost:5173/reset-password/${authToken}`;
      sendMail(email, link);
      res.status(200).json("E-mail envoyé avec succès!");
    } else {
      res.status(409).json("Cet utilisateur n'existe pas!");
    }
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

// Authentification
userRouter.post("/auth/:token", async (req, res) => {
  const token = req.params.token;
  try {
    const decode = jwt.verify(token, process.env.PASSWORD_SECRET_TOKEN);
    if (decode) {
      res.status(200).json(decode);
    } else {
      res.status(401).json("Vous n'etes pas autorisé!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Nouveau Mot de passe
userRouter.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      bcrypt.hash(password, 10, function (err, hashed) {
        if (err) {
          res.status(500).json("Une erreur est survenue!");
        } else {
          findUser.password = hashed;
          findUser.authTokens.pop();
          findUser.save();
          res.status(200).json("Mot de passe changé avec succès!");
        }
      });
    } else {
      res.status(500).json("Une erreur est survenue!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = userRouter;
