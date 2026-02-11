const mongoose = require("mongoose");

const dataBaseConnect = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connexion réussie à la BD"))
    .catch((err) => console.log("Connexion échouée à la BD", err));
};

module.exports = dataBaseConnect;
