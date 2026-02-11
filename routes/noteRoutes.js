const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");
const sendMail = require("../utils/sendMail");
const Note = require("../models/note");

const noteRouter = require("express").Router();

// Toutes les notes
noteRouter.get("/", async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

// Toutes les notes avec des filtres
noteRouter.post("/every", auth, async (req, res) => {
  const { archives, tags } = req.body;
  const user = req.user;
  try {
    const a = await Note.find({
      userId: new mongoose.Types.ObjectId(user._id),
    });
    const filtrer = a?.flatMap((note) => note.tags.map((t) => t));
    const tagss = filtrer.filter(
      (obj, index, self) => index === self.findIndex((o) => o.tag === obj.tag),
    );
    if (tags.length > 0) {
      const notes = await Note.find({
        "tags.tag": tags,
        userId: new mongoose.Types.ObjectId(user._id),
      });
      res.status(200).json({ notes: notes, tags: tagss });
    } else {
      const notes = await Note.find({
        archived: archives,
        userId: new mongoose.Types.ObjectId(user._id),
      });
      res.status(200).json({ notes: notes, tags: tagss });
    }
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

// Note unique
noteRouter.get("/:noteID", auth, async (req, res) => {
  const noteID = req.params.noteID;
  try {
    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(noteID),
    });
    if (note) {
      res.status(200).json(note);
    } else {
      res.status(404).json("Note introuvable!");
    }
  } catch (error) {
    res.status(500).json("Une erreur est survenue!");
  }
});

// Créer nouvelle note
noteRouter.post("/create-note", auth, async (req, res) => {
  const userID = req.user._id;
  try {
    const note = await Note.create({
      userId: userID,
    });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Enregistrer les modifications d'une note
noteRouter.post("/save-note", auth, async (req, res) => {
  const note = req.body;
  const userID = req.user._id;
  try {
    if (!Array.isArray(note.tags)) {
      const tagsArray = note.tags.split(",");
      const findNote = await Note.findOne({
        _id: new mongoose.Types.ObjectId(note._id),
      });
      if (findNote) {
        findNote.tags = [];
        tagsArray.map((tag) => {
          findNote.tags.push({ tag: tag });
        });
        findNote.title = note.title;
        findNote.text = note.text;
        findNote.lastEdit = new Date();
        findNote.save();
        res.status(200).json(findNote);
      } else {
        const createNote = await Note.create({
          userId: userID,
          title: note.title,
          text: note.text,
          lastEdit: new Date(),
        });
        createNote.tags = [];
        tagsArray.map((tag) => {
          createNote.tags.push({ tag: tag });
        });
        createNote.save();
        res.status(200).json(createNote);
      }
    } else {
      const findNote = await Note.findOne({
        _id: new mongoose.Types.ObjectId(note._id),
      });
      findNote.title = note.title;
      findNote.text = note.text;
      findNote.lastEdit = new Date();
      findNote.save();
      res.status(200).json(findNote);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Archiver une note
noteRouter.post("/archive-note", auth, async (req, res) => {
  const note = req.body;
  try {
    const findNote = await Note.findOne({
      _id: new mongoose.Types.ObjectId(note._id),
    });
    if (findNote) {
      findNote.archived = true;
      findNote.save();
      res.status(200).json(findNote);
    } else {
      res.status(409).json("Il y'a un conflit!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Restorer une note archiver
noteRouter.post("/restore-note", auth, async (req, res) => {
  const note = req.body;
  try {
    const findNote = await Note.findOne({
      _id: new mongoose.Types.ObjectId(note._id),
    });
    if (findNote) {
      findNote.archived = false;
      findNote.save();
      res.status(200).json(findNote);
    } else {
      res.status(409).json("Il y'a un conflit!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Supprimer une note
noteRouter.post("/delete-note", auth, async (req, res) => {
  const note = req.body;
  try {
    const deleteNote = await Note.deleteOne({
      _id: new mongoose.Types.ObjectId(note._id),
    });
    res.status(200).json(deleteNote);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = noteRouter;
