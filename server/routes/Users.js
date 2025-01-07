const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const {validateToken} = require("../middlewares/AuthMiddleware")
const {sign} = require("jsonwebtoken")
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Настройка хранилища для аватарок
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "avatarUploads"); // Папка для загрузки аватарок
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
  },
});

const upload = multer({ storage: storage });


router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const hash = await bcrypt.hash(password, 10);
    await Users.create({
      username: username,
      password: hash,
    });

    res.json("SUCCESS");
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An error occurred while creating the user." });
  }
});

// Загрузить/обновить аватарку пользователя
router.post("/avatar", validateToken, upload.single("avatar"), async (req, res) => {
  const userId = req.user.id; // Получаем ID текущего пользователя из токена
  const userPhoto = req.file ? req.file.path : null;

  try {
    // Проверяем, существует ли пользователь
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Удаляем старую аватарку, если она была загружена ранее
    if (user.userPhoto) {
      fs.unlink(path.join(__dirname, "..", user.userPhoto), (err) => {
        if (err) console.error("Ошибка удаления старой аватарки:", err);
      });
    }

    // Обновляем путь к аватарке
    user.userPhoto = userPhoto;
    await user.save();

    res.json({ message: "Аватарка обновлена успешно", userPhoto: `http://localhost:3001/${userPhoto}` });
  } catch (error) {
    console.error("Ошибка загрузки аватарки:", error);
    res.status(500).json({ error: "Не удалось загрузить аватарку" });
  }
});

router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
})

router.get("/basicinfo/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const basicInfo = await Users.findByPk(id, { attributes: { exclude: ["password"] } });
    if (!basicInfo) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    if (basicInfo.userPhoto) {
      basicInfo.userPhoto = `http://localhost:3001/${basicInfo.userPhoto}`;
    }

    res.json(basicInfo);
  } catch (error) {
    console.error("Ошибка получения информации:", error);
    res.status(500).json({ error: "Не удалось получить информацию о пользователе" });
  }
});

router.post("/login", async(req, res) => {
  const {username, password} = req.body;  // По req.body приходят данные отправленные пользователем и разбираем их на имя и пароль
  const user = await Users.findOne({where: {username: username}})

  if(!user) return res.json({error: "User doesn't exist!"})
  
  bcrypt.compare(password, user.password).then((match) => {
    if(!match) {
      return res.json({error: "Wrong username and password combination"})
    }
    //Генерация токена
    const accessToken = sign({username: user.username, id: user.id}, "secret")

    //Сохранение токена в cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // Убедитесь, что у вас HTTPS
      sameSite: "Lax",
    })

    // Отправка данных без токена так как он уже хранится в cookie
    res.json({username:user.username, id: user.id})
  })
})

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json("Exit user")
})


// Подписаться на пользователя
router.post("/subscribe/:userId", validateToken, async (req, res) => {
  const followerId = req.user.id; // ID текущего пользователя
  const followingId = parseInt(req.params.userId); // ID пользователя, на которого подписываются

  try {
    const follower = await Users.findByPk(followerId);
    const following = await Users.findByPk(followingId);

    if (!following) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await follower.addFollowing(following); // Добавляем подписку
    res.json({ message: "Вы успешно подписались" });
  } catch (error) {
    console.error("Ошибка подписки:", error);
    res.status(500).json({ error: "Не удалось подписаться" });
  }
});

// Отписаться от пользователя
router.post("/unsubscribe/:userId", validateToken, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId); // ID пользователя, на которого подписываются

  try {
    const follower = await Users.findByPk(followerId);
    const following = await Users.findByPk(followingId);

    if (!following) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await follower.removeFollowing(following); // Удаляем подписку
    res.json({ message: "Вы успешно отписались" });
  } catch (error) {
    console.error("Ошибка отписки:", error);
    res.status(500).json({ error: "Не удалось отписаться" });
  }
});

router.get("/subscriptions/status/:userId", validateToken, async (req, res) => {
  const { userId } = req.params;
  console.log(userId)

  try {
    // Проверяем, подписан ли текущий пользователь (req.user.id) на пользователя userId
    const subscription = await Users.findOne({
      where: { id: req.user.id }, // Ищем текущего пользователя
      include: {
        model: Users,
        as: "Following", // Проверяем связи "на кого подписан"
        where: { id: userId }, // Ищем связь с указанным userId
        attributes: [], // Убираем из ответа лишние данные
      },
    });


    res.json({ isSubscribed: !!subscription, subscribed: subscription }); // Вернет true или false
    console.log("sdfsdff", subscription)
  } catch (error) {
    console.error("Ошибка проверки статуса подписки:", error);
    res.status(500).json({ error: "Не удалось проверить статус подписки" });
  }
});

// Получить список подписчиков
router.get("/followers/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await Users.findByPk(userId, {
      include: [{ model: Users, as: "Followers" }], // Загрузка подписчиков
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(user.Followers);
  } catch (error) {
    console.error("Ошибка получения подписчиков:", error);
    res.status(500).json({ error: "Не удалось получить подписчиков" });
  }
});

// Получить список подписок
router.get("/following/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await Users.findByPk(userId, {
      include: [{ model: Users, as: "Following" }], // Загрузка подписок
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(user.Following);
  } catch (error) {
    console.error("Ошибка получения подписок:", error);
    res.status(500).json({ error: "Не удалось получить подписки" });
  }
});



module.exports = router;