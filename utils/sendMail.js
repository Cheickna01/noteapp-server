const nodemailer = require("nodemailer");
const sendMail = async (email, link) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.BREVO_API_KEY,
    },
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
