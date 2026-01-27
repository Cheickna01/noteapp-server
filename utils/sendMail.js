const nodemailer = require("nodemailer");
const sendMail = async (email, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
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

  try {
    await transporter.sendMail(mailOptions, (err, info) => {
    return info
  });
  } catch (error) {
    console.log(error,"catch")
    return error
  }
};

module.exports = sendMail
