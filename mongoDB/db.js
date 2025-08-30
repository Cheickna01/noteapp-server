const mongoose = require("mongoose");

const dataBaseConnect = () => {
  try {
    mongoose.connect("mongodb://localhost:27017/noteapp");
    console.log("Connexion réussie à la BD");
  } catch (error) {
    console.log("Connexion échouée à la BD");
  }
};

module.exports = dataBaseConnect
