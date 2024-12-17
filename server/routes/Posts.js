const express = require('express');
const router = express.Router();
const { Posts, Likes } = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs")
const {validateToken} = require("../middlewares/AuthMiddleware")
const { Op } = require("sequelize");

// Настраиваем multer для хранения файлов в папке "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
  },
});

const upload = multer({ storage: storage });

// Маршрут для получения всех постов
router.get("/", validateToken, async (req, res) => {
  try {
    const { tags } = req.query;  // Получаем теги из параметров запроса (например, tags=tag1,tag2)

    // Формируем массив тегов, если они указаны
    const tagArray = tags ? tags.split(',') : [];

    // Получаем все посты с лайками
    const listOfPosts = await Posts.findAll({
      include: [Likes],
    });

    // Получаем лайки текущего пользователя
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });

    // Форматируем данные: преобразуем теги в массивы и добавляем путь к изображениям
    const formattedPosts = listOfPosts.map((post) => ({
      ...post.dataValues,
      tags: post.tags ? post.tags.split(",") : [], // Преобразуем строку тегов в массив
      imagePath: post.imagePath
        ? `http://localhost:3001/${post.imagePath}`
        : null,
    }));

    // Фильтруем посты, если теги указаны
    const filteredPosts = tagArray.length
      ? formattedPosts.filter((post) =>
          post.tags.some((tag) => tagArray.includes(tag))
        )
      : formattedPosts;

    // Отправляем данные клиенту
    res.json({ listOfPosts: filteredPosts, likedPosts });
  } catch (error) {
    console.error("Ошибка при получении списка постов", error);
    res.status(500).json({ error: "Ошибка получения постов" });
  }
});

router.get("/default", async (req, res) => {
  const { tags } = req.query;  // Получаем теги из параметров запроса (например, tags=tag1,tag2)

    // Формируем массив тегов, если они указаны
    const tagArray = tags ? tags.split(',') : [];
  const listOfPosts = await Posts.findAll({include: [Likes]});
  const likedPosts = await Likes.findAll();
  try{
  const formattedPosts = listOfPosts.map(post => ({
    ...post.dataValues,
    tags: post.tags ? post.tags.split(",") : [], // Преобразуем строку тегов в массив
    imagePath: post.imagePath ? `http://localhost:3001/${(post.imagePath)}` : null  
}));
const filteredPosts = tagArray.length
      ? formattedPosts.filter((post) =>
          post.tags.some((tag) => tagArray.includes(tag))
        )
      : formattedPosts;
  res.json({ listOfPosts: filteredPosts, likedPosts: likedPosts });
} catch (error) {
  console.error("Ошибка при получении списка постов", error)
  res.status(404).json({error: "Ошибка получения постов"})
}
});

router.get("/recommendations/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    // Находим текущий пост по ID
    const currentPost = await Posts.findByPk(postId);
    if (!currentPost) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Извлекаем теги текущего поста
    const currentTags = currentPost.dataValues.tags 
      ? currentPost.dataValues.tags.split(",").map((tag) => tag.trim()) 
      : [];

    if (currentTags.length === 0) {
      return res.status(200).json({ recommendations: [] }); // Если тегов нет, возвращаем пустой список
    }

    // Формируем условия для поиска хотя бы одного совпадения
    const tagConditions = currentTags.map((tag) => ({
      tags: { [Op.like]: `%${tag}%` },
    }));

    // Находим посты с похожими тегами
    const similarPosts = await Posts.findAll({
      where: {
        id: { [Op.ne]: postId }, // Исключаем текущий пост
        [Op.or]: tagConditions, // Условие на совпадение хотя бы одного тега
      },
      limit: 5, // Ограничиваем количество результатов
    });

    // Форматируем данные и добавляем путь к изображениям
    const recommendations = similarPosts.map((post) => ({
      ...post.dataValues,
      tags: post.dataValues.tags ? post.dataValues.tags.split(",") : [],
      imagePath: post.imagePath ? `http://localhost:3001/${post.imagePath}` : null,
    }));

    res.json({ recommendations });
  } catch (error) {
    console.error("Ошибка при получении рекомендаций:", error);
    res.status(500).json({ error: "Не удалось получить рекомендации" });
  }
});

router.get("/byuserId/:id", async (req, res) => {
  const id = req.params.id
  const listOfPosts = await Posts.findAll({where: {UserId: id}, include: [Likes]});
  let likedPosts = await Likes.findAll({where: {UserId: id}});
  try{
  const formattedPosts = listOfPosts.map(post => ({
    ...post.dataValues,
    imagePath: post.imagePath ? `http://localhost:3001/${(post.imagePath)}` : null  
}));

  let formattedLikedPosts = likedPosts.map(post => post.PostId)

  if(formattedLikedPosts) {
    likedPosts = await Posts.findAll({where: {id: formattedLikedPosts}})
  } else {
    console.error("Лайкнутых постов не обнаружено")
  }

  formattedLikedPosts = likedPosts.map(post => ({
    ...post.dataValues,
    imagePath: post.imagePath ? `http://localhost:3001/${(post.imagePath)}` : null  
  }))

  res.json({ listOfPosts: formattedPosts, formattedLikedPosts: formattedLikedPosts });
} catch (error) {
  console.error("Ошибка при получении списка постов", error)
  res.status(404).json({error: "Ошибка получения постов"})
}
});


router.get("/byId/:id", async (req, res) => {
  const id = req.params.id
  const post = await Posts.findByPk(id)   //Pk - primaryKey (Первичный ключ таблицы)
  const userId = post.dataValues.UserId;
  post.userId = userId
  if (post.imagePath) {
    post.imagePath = `http://localhost:3001/${(post.imagePath)}`
  } else {
    console.error("Картинка не найдена")
  }
  res.json(post)
})

// Маршрут для создания поста с изображением
router.post("/", validateToken, upload.single("image"), async (req, res) => {
  let { title, tags } = req.body;  // Get the title and tags
  const username = req.user.username;
  const userId = req.user.id;
  const imagePath = req.file ? req.file.path : null;

  // Ensure tags is an array, if it's a string, split it by commas


  try {
    const post = await Posts.create({ title, username, imagePath, UserId: userId, tags: tags });
    res.json(post);
  } catch (error) {
    console.error("Ошибка создания поста:", error);
    res.status(500).json({ error: "Не удалось создать пост." });
  }
});

router.put("/changePost", validateToken, upload.single("image"), async (req, res) => {
  const { title, id } = req.body;
  const newImagePath = req.file ? req.file.path : null;

  try {
    const post = await Posts.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Удаление старого изображения, если загружается новое
    if (newImagePath && post.imagePath) {
      const oldImagePath = path.join(__dirname, "..", post.imagePath);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Ошибка при удалении старого изображения:", err);
        } else {
          console.log("Старое изображение успешно удалено");
        }
      });
    }

    // Обновляем только те поля, которые были переданы
    const updatedData = {};
    if (title) updatedData.title = title;
    if (newImagePath) updatedData.imagePath = newImagePath;

    await post.update(updatedData);
    res.json({ message: "Пост успешно обновлен", post });
  } catch (error) {
    console.error("Ошибка при обновлении поста:", error);
    res.status(500).json({ error: "Не удалось обновить пост." });
  }
});

router.delete("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Posts.findByPk(String(postId));
    if(!post) {
      return res.status(404).json({error: "Пост не найден"});
    }
    const imagePath = post.imagePath;
    if (imagePath) {
      fs.unlink(path.join(__dirname, "..", imagePath), (err) => { //path.join - собирает путь в единое целое, __dirname - абсолютный путь к файлу, ".." - родительская дериктория
        if(err) {
          console.error("Ошибка при удалении поста", err);
          return res.status(500).json({error: "Ошибка при удалении поста"})
        }
        console.log("Пост успешно удален")
      })
    }
    await Posts.destroy({                      // У sequelize есть метод destroy() который удаляет строку из таблицы 
      where: {
        id: postId,
      },
    });
    
    res.json({message: "Пост и изображение успешно удалены"})
  } catch(error) {
    console.error("Ошибка при удалении поста", error);
    res.status(500).json({error: "Ошибка сервера"})
  }
});

module.exports = router;