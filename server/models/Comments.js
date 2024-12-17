module.exports = (sequelize, DataTypes) => {
  const Comments = sequelize.define("Comments", {
    commentBody: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imagePath: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Comments;
};
