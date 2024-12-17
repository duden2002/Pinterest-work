module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define("Posts", {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imagePath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.STRING, // Теги будут храниться как строка, разделённая запятыми
        allowNull: false,
      },
    });
    Posts.associate = (models) => {
      Posts.hasMany(models.Comments, {
          onDelete: "cascade",
      });
      Posts.hasMany(models.Likes, {
        onDelete: "cascade",
      });
    }
    return Posts;
  };