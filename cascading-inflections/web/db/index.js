const { Sequelize, Model } = require("sequelize");

function pause(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function init(sequelizeConfig) {
  console.log(JSON.stringify(sequelizeConfig));
  try {
    class User extends Model {}
    class Message extends Model {}

    console.log('Waiting for database connection...');
    let success = false;
    let attempts = 0;
    while (!success && attempts < 5) {
      try {  
        const sequelizeInit = new Sequelize(sequelizeConfig);
        await sequelizeInit.query("CREATE DATABASE IF NOT EXISTS `cascading_inflections`;");
        success = true;
      } catch (e) {
        attempts++;
        console.log(`Attempt ${attempts} failed(${e.name}): `, e.message);
        console.log('Waiting 30 seconds');
        await pause(30000);
      }
    }
    if (attempts === 5) {
      console.error('Failed to access database connection');
    } else {
      console.log('Database connection success');
    }
  
    sequelizeConfig.database = 'cascading_inflections';
    const sequelize = new Sequelize(sequelizeConfig);
  
    User.init(
      {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: Sequelize.STRING, unique: true },
        password: Sequelize.STRING,
        admin: Sequelize.BOOLEAN,
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        siteUrl: Sequelize.STRING,
      },
      { sequelize, modelName: "user" }
    );
  
    Message.init(
      {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        message: Sequelize.TEXT('medium'),
        sender: Sequelize.STRING,
      },
      { sequelize, modelName: "message" }
    );
  
    User.hasMany(Message, { foreignKey: "recipient" });
  
    await User.sync();
    await Message.sync();

    return {
      users: User,
      messages: Message,
      sequelize,
    };
  } catch (e) {
    console.error('Error initializing database', e);
    throw e;
  }

};

module.exports = init;
