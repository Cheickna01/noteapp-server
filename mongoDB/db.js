const mongoose = require("mongoose");

const dataBaseConnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connexion réussie à la BD");
  } catch (error) {
    console.log("Connexion échouée à la BD");
    console.log(error);
  }
};

module.exports = dataBaseConnect;
