const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());

// Статическая папка для изображений
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/commentUploads", express.static(path.join(__dirname, "commentUploads")));
app.use("/avatarUploads", express.static(path.join(__dirname, "avatarUploads")));

const db = require("./models");

const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);
const postsRouter = require("./routes/Posts");
app.use("/posts", postsRouter);
const otherRouter = require("./routes/Other");
app.use("/other", otherRouter);
const commentsRouter = require("./routes/Comments");
app.use("/comment", commentsRouter);
const likesRouter = require('./routes/Likes')
app.use("/like", likesRouter)
const collectionsRouter = require('./routes/Collections')
app.use("/collection", collectionsRouter)

db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
});