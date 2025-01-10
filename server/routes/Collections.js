const express = require('express')
const router = express.Router()
const { Collections } = require('../models')
const {validateToken} = require("../middlewares/AuthMiddleware")

router.post("/", validateToken, async(req, res) => {
    const {PostId} = req.body;
    const UserId = req.user.id;

    const found = await Collections.findOne({where: {PostId: PostId, UserId: UserId}})
    if(!found) {
        await Collections.create({PostId: PostId, UserId: UserId})
        res.json({collect: true})
    } else {
        await Collections.destroy({
            where: {PostId: PostId, UserId: UserId}
        })
        res.json({collect: false})
    }
})

router.put("/addcollection", validateToken, async(req, res) => {
    const { PostId, groupName } = req.body; // Получаем ID поста и имя группы
    const UserId = req.user.id; // ID пользователя из токена

    try {
        // Проходим по всем PostId и ищем коллекции для каждого PostId и UserId
        const collections = await Collections.findAll({
            where: {
                PostId: PostId, // Здесь мы ищем все коллекции с указанными PostId
                UserId: UserId   // и для текущего пользователя
            }
        });

        // Если коллекции не найдены
        if (!collections || collections.length === 0) {
            return res.status(404).json({ error: "Коллекция не найдена" });
        }

        // Обновляем каждую коллекцию
        await Promise.all(collections.map(collection => 
            collection.update({ groupName }) // Обновляем groupName
        ));

        res.json({ message: "Коллекция успешно обновлена", collections });
    } catch (error) {
        console.error("Ошибка при обновлении группы коллекции:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

router.put("/editcollection/:groupName", validateToken, async (req, res) => {
    const newGroupName = req.body.newGroupName;
    const PostId = req.body.PostId;
  
    try {
      const otherCollections = await Collections.findAll({
        where: {
          PostId: PostId,
          UserId: req.user.id,
        }
      })
  
      if (!otherCollections) {
        return res.status(404).json({ error: "Папка не найдена" });
      }
  
      await Promise.all(otherCollections.map(collections => 
        collections.update({ groupName: newGroupName }) // Обновляем groupName
    ));
  
      const updatedCollections = await Collections.findAll({
        where: {
          UserId: req.user.id,
        },
      });
  
      res.json({ message: "Папка успешно обновлена", filteredGroupArr: updatedCollections.map((collection) => collection.groupName) });
    } catch (error) {
      console.error("Ошибка при обновлении папки:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  router.delete("/deletecollection/:groupName", validateToken, async (req, res) => {
    const { groupName } = req.params;
  
    try {
      const collection = await Collections.findAll({
        where: {
          groupName: groupName,
          UserId: req.user.id,
        },
      });
  
      if (!collection) {
        return res.status(404).json({ error: "Папка не найдена" });
      }
  
      await Promise.all(collection.map(collections => 
        collections.update({ groupName: null })
    ));
  
      const updatedCollections = await Collections.findAll({
        where: {
          UserId: req.user.id,
        },
      });
  
      res.json({ message: "Папка успешно удалена", filteredGroupArr: updatedCollections.map((collection) => collection.groupName) });
    } catch (error) {
      console.error("Ошибка при удалении папки:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });


module.exports = router;