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


module.exports = router;