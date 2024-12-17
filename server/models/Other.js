module.exports = (sequelize, DataTypes) => {
    const Other = sequelize.define("Other", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.BLOB,
            allowNull: false,
        }
    })
    return Other;
}