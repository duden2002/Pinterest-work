const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs")
const { validateToken } = require("../middlewares/AuthMiddleware");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "commentUploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    },
  });
  
  const upload = multer({ storage: storage });

router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({ where: { PostId: postId } });
  comments.forEach(comment => {
    if (comment.imagePath) {
      comment.imagePath = `http://localhost:3001/${comment.imagePath}`;
    }
  });
  res.json(comments);
});

router.post("/", validateToken, upload.single("image"), async (req, res) => {
  const comment = req.body;
  const username = req.user.username;
  const imagePath = req.file ? req.file.path : null;
  comment.username = username;
  comment.imagePath = imagePath              //Обращаемя к таблице Comments в которой уже указали новый столбец с названием username
  await Comments.create(comment);
  res.json(comment);
});

router.delete("/:commentId", validateToken, async (req, res) => {
  const commentId = req.params.commentId; // Получение id комментария
  try {
    const comment = await Comments.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({error: "Комментарий не найден"})
    }

    const imagePath = comment.imagePath;
    if(imagePath !== null) {
      
      fs.unlink(path.join(__dirname, "..", imagePath), (err) => {  //path.join - собирает путь в единое целое, __dirname - абсолютный путь к файлу, ".." - родительская дериктория
        if(err) {
          console.error("Ошибка при удалении файла", err);
          return res.status(500).json({error: "Ошибка при удалении файла"})
        }
        console.log("Файл успешно удален")
      })
    }
    await Comments.destroy({                      // У sequelize есть метод destroy() который удаляет строку из таблицы 
      where: {
        id: commentId,
      },
    });
    
    res.json({message: "Комментарий и изображение удалены успешно"})
  } catch (error) {
    console.error("Ошибка при удалении комменатрия", error);
    res.status(500).json({error: "Ошибка сервера"})
  }
});

module.exports = router;