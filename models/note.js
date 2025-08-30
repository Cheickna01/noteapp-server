const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  title: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  tags: [
    {
      tag: {
        type: String,
      },
    },
  ],
  archived: {
    type: Boolean,
    default: false,
  },
  lastEdit: {
    type: Date,
  },
});

const Note = mongoose.model("notes", noteSchema);

module.exports = Note;
