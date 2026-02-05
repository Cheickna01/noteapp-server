const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");
const dataBaseConnect = require("./mongoDB/db");
dataBaseConnect();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://notappl.netlify.app"],
    credentials: true,
  })
);

app.use("/api", userRouter);
app.use("/api/notes", noteRouter);

app.listen(process.env.PORT, () => {
  console.log("Serveur en écoute...");
});
