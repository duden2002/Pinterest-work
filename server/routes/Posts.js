const express = require('express');
const router = express.Router();
const { Posts, Likes, Collections, Users, Comments } = require("../models");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs")
const {validateToken} = require("../middlewares/AuthMiddleware")
const { Op } = require("sequelize");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Функция для обработки изображения с помощью sharp
const processImage = async (buffer, filename) => {
  const outputDir = path.join(__dirname, "..", "uploads");
  const outputPath = path.join(outputDir, filename);

  // Убедитесь, что директория для сохранения существует
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(buffer)
    .jpeg({ quality: 80 }) // Сохраняем в формате JPEG с качеством 80%
    .toFile(outputPath);

  return `uploads/${filename}`;
};

// Маршрут для получения всех постов
router.get("/", validateToken, async (req, res) => {
  try {
    const { tags } = req.query;  // Получаем теги из параметров запроса (например, tags=tag1,tag2)

    // Формируем массив тегов, если они указаны
    const tagArray = tags ? tags.split(',') : [];

    // Получаем все посты с лайками
    const listOfPosts = await Posts.findAll({
      include: [
        { model: Likes, where: { UserId: req.user.id }, required: false },
        { model: Collections, where: { UserId: req.user.id }, required: false },
      ],
    });

    

    // Получаем лайки текущего пользователя
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id }});
    const collect = await Collections.findAll({ where: { UserId: req.user.id }});
    const group = await Collections.findAll({ where: { UserId: req.user.id, groupName: {[Op.ne]: ""} }});
    
    const groupArr = group.map((item) => item.groupName);
    const filteredGroupArr = [...new Set(groupArr)]
    console.log("Группа", filteredGroupArr)

    const user = await Users.findAll({
      where: {username: listOfPosts.map((post) => (post.username))},
      attributes: ['userPhoto', 'id']
    })


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

        

      filteredPosts.reverse()
    // Отправляем данные клиенту
    res.json({ listOfPosts: filteredPosts, likedPosts, collect, filteredGroupArr: filteredGroupArr, usersImages: user });
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

        filteredPosts.reverse()

        const user = await Users.findAll({
          where: {username: listOfPosts.map((post) => (post.username))},
          attributes: ['userPhoto', 'id']
        })

  res.json({ listOfPosts: filteredPosts, likedPosts: likedPosts, usersImages: user });
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


router.get("/byuserId/:id", validateToken, async (req, res) => {
  const id = req.params.id
  const listOfPosts = await Posts.findAll({where: {UserId: id}}, {include: [
    { model: Likes, where: { UserId: req.user.id }, required: false },
    { model: Collections, where: { UserId: req.user.id }, required: false },
  ],});
  let likedPosts = await Likes.findAll({where: {UserId: id}});
  let collectPosts = await Collections.findAll({where: {UserId: id}});
  let defaultCollectPosts = await Collections.findAll({where: {UserId: id}});
  try{
  const formattedPosts = listOfPosts.map(post => ({
    ...post.dataValues,
    imagePath: post.imagePath ? `http://localhost:3001/${(post.imagePath)}` : null  
}));

  let formattedLikedPosts = likedPosts.map(post => post.PostId)
  let formattedCollectPosts = collectPosts.map(post => post.PostId)


  const userLikedPosts = await Likes.findAll({ where: { UserId: req.user.id }});
  const userCollect = await Collections.findAll({ where: { UserId: req.user.id }});

  if(formattedLikedPosts) {
    likedPosts = await Posts.findAll({where: {id: formattedLikedPosts}})
  } else {
    console.error("Лайкнутых постов не обнаружено")
  }
  if(formattedCollectPosts) {
    collectPosts = await Posts.findAll({where: {id: formattedCollectPosts}})
  } else {
    console.error("Лайкнутых постов не обнаружено")
  }

  formattedLikedPosts = likedPosts.map(post => ({
    ...post.dataValues,
    imagePath: post.imagePath ? `http://localhost:3001/${(post.imagePath)}` : null  
  }))
  formattedCollectPosts = collectPosts.map(post => ({
    ...post.dataValues,
    imagePath: post.imagePath ? `http://localhost:3001/${(post.imagePath)}` : null  
  }))

  formattedPosts.reverse()

  const userPhotosInCollections = await Users.findAll({attributes: ["id", "userPhoto"]});


  console.log(userPhotosInCollections)


  res.json({ userPhotosInCollections: userPhotosInCollections, listOfPosts: formattedPosts, userLikedPosts: userLikedPosts, userCollect: userCollect, formattedLikedPosts: formattedLikedPosts, formattedCollectPosts: formattedCollectPosts, defaultCollectPosts: defaultCollectPosts });
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
  let { title, tags } = req.body;
  const username = req.user.username;
  const userId = req.user.id;

  try {
    let imagePath = null;

    if (req.file) {
      // Генерация имени файла
      const filename = Date.now() + ".jpg";

      // Обработка изображения через sharp
      imagePath = await processImage(req.file.buffer, filename);
    }

    const post = await Posts.create({
      title,
      username,
      imagePath,
      UserId: userId,
      tags,
    });

    res.json(post);
  } catch (error) {
    console.error("Ошибка создания поста:", error);
    res.status(500).json({ error: "Не удалось создать пост." });
  }
});

router.put("/changePost", validateToken, upload.single("image"), async (req, res) => {
  const { title, id, tags } = req.body;

  try {
    const post = await Posts.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    let newImagePath = post.imagePath;

    if (req.file) {
      // Генерация имени файла для нового изображения
      const filename = Date.now() + ".jpg";

      // Обработка нового изображения через sharp
      newImagePath = await processImage(req.file.buffer, filename);

      // Удаление старого изображения
      if (post.imagePath) {
        const oldImagePath = path.join(__dirname, "..", post.imagePath);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Ошибка при удалении старого изображения:", err);
          } else {
            console.log("Старое изображение успешно удалено");
          }
        });
      }
    }

    // Обновляем пост
    const updatedData = { title, tags, imagePath: newImagePath };
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
    const post = await Posts.findByPk(String(postId), {
      include: [{ model: Comments }] // Включаем комментарии при поиске поста
    });

    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Удаление изображений в комментариях
    for (const comment of post.Comments) {
      const imagePath = comment.imagePath;
      if (imagePath) {
        const filePath = path.join(__dirname, "..", imagePath);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error("Ошибка при проверке файла:", err);
          } else if (stats.isFile()) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("Ошибка при удалении файла комментария:", err);
              } else {
                console.log("Файл комментария успешно удален");
              }
            });
          }
        });
      }
    }

    // Удаляем все комментарии к посту
    await Comments.destroy({ where: { postId: postId } });

    // Удаляем изображение поста
    const imagePath = post.imagePath;
    if (imagePath) {
      fs.unlink(path.join(__dirname, "..", imagePath), (err) => {
        if (err) {
          console.error("Ошибка при удалении поста", err);
          return res.status(500).json({ error: "Ошибка при удалении поста" });
        }
        console.log("Пост и его изображение успешно удалены");
      });
    }

    // Удаляем сам пост
    await Posts.destroy({
      where: {
        id: postId,
      },
    });

    res.json({ message: "Пост, комментарии и изображения успешно удалены" });
  } catch (error) {
    console.error("Ошибка при удалении поста", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;