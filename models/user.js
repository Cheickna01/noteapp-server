const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  authTokens: [{
    authToken: {
        type: String
    }
  }]
});

const User = mongoose.model("users", userSchema);

module.exports = User;
