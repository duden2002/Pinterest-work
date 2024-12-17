const express = require('express')
const router = express.Router()
const {Other} = require("../models")

router.get("/", async(req, res) => {
    const listOfPosts = await Other.findAll({})
    console.log(listOfPosts)
    const postsWithImageBase64 = listOfPosts.map(post => {
        if (post.image) {
            // Преобразуем BLOB в base64 строку
            const base64Image = post.image.toString('base64');
            return {
                ...post.toJSON(),
                image: `data:image/png;base64,${base64Image}`
            };
        }
        return post;
    });

    res.json({ listOfPosts: postsWithImageBase64 });
})

const multer = require('multer');
const upload = multer();

router.post("/", upload.single("image"), async (req, res) => {
    const { title } = req.body;
    const image = req.file.buffer; // получаем данные изображения как BLOB

    const post = { title, image };
    await Other.create(post);
    res.json(post);
});

module.exports = router;