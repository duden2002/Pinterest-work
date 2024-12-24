module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userPhoto: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });

    Users.associate = (models) => {
        Users.hasMany(models.Posts, {
            onDelete: "cascade",
        });
        Users.hasMany(models.Likes, {
            onDelete: "cascade",
        })
        Users.hasMany(models.Collections, {
            onDelete: "cascade",
        })

        // Связь many-to-many для подписчиков
        Users.belongsToMany(models.Users, {
            through: "UserSubscriptions", // Имя вспомогательной таблицы
            as: "Followers",             // Подписчики
            foreignKey: "followingId",
        });

        Users.belongsToMany(models.Users, {
            through: "UserSubscriptions",
            as: "Following",             // На кого подписан
            foreignKey: "followerId",
        });
    };

    return Users;
};