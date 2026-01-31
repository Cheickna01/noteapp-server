const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");
const nodemailer = require("nodemailer");

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
              { expiresIn: "1h" },
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
        },
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
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  try {
    const isSame = await bcrypt.compare(password, user.password);
    if (!isSame) {
      res.status(401).json(isSame);
    } else {
      const hashedPassword = bcrypt.hash(
        newPassword,
        10,
        function (err, hashed) {
          if (err) {
            res.status(500).json("Une erreur est survenue!");
          } else {
            user.password = hashed;
            user.save();
            res.status(200).json({
              success: isSame,
              message: "Le mot de passe actuel est incorrect.",
            });
          }
        },
      );
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
        { expiresIn: "1h" },
      );
      findUser.authTokens[0] = { authToken };
      findUser.save();
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Doit rester false pour le port 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      // const sendEmail = async (email, link) => {
      //   const mailOptions = {
      //     from: `"Support" ${process.env.SMTP_FROM}`,
      //     to: email,
      //     subject: "Lien de récupération de compte",
      //     html: `
      //         <p>Bonjour,</p>
      //         <p>Vous avez demandé à réinitialiser votre mot de passe.
      //         Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
      //         </p>
      //         <a href="${link}">Réinitialiser mon mot de passe</a>
      //         <p>Ce lien est valable pendant 48 heures. Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.</p>
      //         <p>Merci,</p>
      //         <p>L'équipe NOTEAPP</p>
      //       `,
      //   };

      //   try {
      //     await transporter.sendMail(mailOptions);
      //     res.status(200).json("E-mail envoyé avec succès!");
      //   } catch (error) {
      //     console.log("Erreur lors de l'envoi de l'email :", error);
      //   }
      // };

      const sendEmail = async (email, link) => {
        try {
          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              accept: "application/json",
              "api-key": process.env.BREVO_API_KEY,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: "Support NOTEAPP",
                email: process.env.SMTP_FROM, // Votre email validé sur Brevo
              },
              to: [{ email: email }],
              subject: "Lien de récupération de compte",
              htmlContent: `
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
              <a href="${link}">Réinitialiser mon mot de passe</a>
              <p>L'équipe NOTEAPP</p>
            `,
            }),
          });

          if (response.ok) {
            console.log("Email envoyé via API !");
          } else {
            const errorData = await response.json();
            console.error("Erreur Brevo API :", errorData);
          }
        } catch (error) {
          console.error("Erreur réseau :", error);
        }
      };
      const link = `https://noteapp-client-production.up.railway.app/reset-password/${authToken}`;
      console.log(email);
      sendEmail(email, link);
    } else {
      res.status(409).json("Cet utilisateur n'existe pas!");
    }
  } catch (error) {
    console.log(error);
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
