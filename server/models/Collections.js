module.exports = (sequelize, DataTypes) => {
    const Collections = sequelize.define("Collections", {
        groupName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    })
    return Collections;
}