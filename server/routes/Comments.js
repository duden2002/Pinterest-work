const express = require("express");
const router = express.Router();
const { Comments, Users } = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { validateToken } = require("../middlewares/AuthMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Функция для обработки изображения с помощью sharp
const processImage = async (buffer, filename) => {
  const outputDir = path.join(__dirname, "..", "commentUploads");
  const outputPath = path.join(outputDir, filename);

  // Убедитесь, что директория для сохранения существует
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(buffer)
    .jpeg({ quality: 80 }) // Сохраняем в формате JPEG с качеством 80%
    .toFile(outputPath);

  return `commentUploads/${filename}`;  // Путь к файлу относительно публичной директории
};

// Получение комментариев
router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    const comments = await Comments.findAll({ where: { PostId: postId } });
    comments.forEach((comment) => {
      if (comment.imagePath) {
        comment.imagePath = `http://localhost:3001/${comment.imagePath}`;
      }
    });

    const user = await Users.findAll({
      where: { username: comments.map((post) => post.username) },
      attributes: ["userPhoto", "username", "id"],
    });

    comments.reverse();
    res.json({ comments: comments, user: user });
  } catch (error) {
    console.error("Ошибка при получении комментариев:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Создание комментария с обработкой изображения через Sharp
router.post("/", validateToken, upload.single("image"), async (req, res) => {
  try {
    const comment = req.body;
    const username = req.user.username;
    let imagePath = null;

    if (req.file) {
      // Генерация имени файла
      const filename = Date.now() + ".jpg";

      // Обработка изображения через sharp
      imagePath = await processImage(req.file.buffer, filename);
    }

    comment.username = username;
    comment.imagePath = imagePath;

    const createdComment = await Comments.create(comment);
    res.json(createdComment);
  } catch (error) {
    console.error("Ошибка при создании комментария:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление комментария и изображения
router.delete("/:commentId", validateToken, async (req, res) => {
  const commentId = req.params.commentId;
  try {
    const comment = await Comments.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Комментарий не найден" });
    }

    const imagePath = comment.imagePath;
    if (imagePath !== null) {
      const filePath = path.join(__dirname, "..", imagePath);  // Абсолютный путь к файлу

      // Проверка существует ли файл, и только затем удаление
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Ошибка при проверке файла:", err);
          return res.status(500).json({ error: "Ошибка при проверке файла" });
        }

        if (stats.isFile()) {
          fs.unlink(filePath, (err) => {  // Удаляем изображение
            if (err) {
              console.error("Ошибка при удалении файла:", err);
              return res.status(500).json({ error: "Ошибка при удалении файла" });
            }
            console.log("Файл успешно удалён");
          });
        } else {
          console.error("Это не файл или файл не найден");
        }
      });
    }

    await Comments.destroy({ where: { id: commentId } });
    res.json({ message: "Комментарий и изображение удалены успешно" });
  } catch (error) {
    console.error("Ошибка при удалении комментария:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;