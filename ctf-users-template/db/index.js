const { Sequelize, Model } = require("sequelize");

const init = (path) => {
  class User extends Model {}

  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path,
  });

  User.init(
    {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: Sequelize.STRING, unique: true },
      password: Sequelize.STRING,
    },
    { sequelize, modelName: "user" }
  );

  User.sync();

  return {
    users: User,
    sequelize,
  };
};

module.exports = init;
