const nodemailer = require("nodemailer");
const sendMail = async (email, link) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Doit être false pour le port 587
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Aide à passer les blocages de certificats sur Render
      minVersion: "TLSv1.2", // Force une version de sécurité moderne
    },
    connectionTimeout: 10000,
  });

  const mailOptions = {
    from: `"Support" ${process.env.USER}`,
    to: email,
    subject: "Lien de récupération de compte",
    html: `
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe.
              Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
              </p>
              <a href="${link}">Réinitialiser mon mot de passe</a>
              <p>Ce lien est valable pendant 48 heures. Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.</p>
              <p>Merci,</p>
              <p>L'équipe NOTEAPP</p>
            `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
