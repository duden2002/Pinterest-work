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


module.exports = router;