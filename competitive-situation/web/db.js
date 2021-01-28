const { Sequelize, Model } = require("sequelize");

function pause(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function init(sequelizeConfig) {
  try {
    class User extends Model {}
    class VerificationToken extends Model {}

    console.log('Waiting for database connection...');
    let success = false;
    let attempts = 0;
    while (!success && attempts < 5) {
      try {  
        const sequelizeInit = new Sequelize(sequelizeConfig);
        await sequelizeInit.query("CREATE DATABASE IF NOT EXISTS `competitive_situation`;");
        success = true;
      } catch (e) {
        attempts++;
        console.log(`Attempt ${attempts} failed(${e.name}): `, e.message);
        console.log('Waiting 30 seconds');
        await pause(30000);
      }
    }
    if (attempts === 5) {
      console.error('Failed to access database connection')
    } else {
      console.log('Database connection success');
    }
  
    sequelizeConfig.database = 'competitive_situation';
    const sequelize = new Sequelize(sequelizeConfig);
  
    User.init(
      {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: Sequelize.STRING, unique: true },
        password: Sequelize.STRING,
        email: Sequelize.STRING,
        unverifiedEmail: Sequelize.STRING
      },
      { sequelize, modelName: "user" }
    );

    VerificationToken.init({
      token: { type: Sequelize.STRING, primaryKey: true },
      valid: Sequelize.BOOLEAN,
      userId: Sequelize.INTEGER
    }, { sequelize, modelName: "verificationToken" })
  
    await User.sync();
    await VerificationToken.sync();

    return {
      users: User,
      verificationTokens: VerificationToken,
      sequelize,
    };
  } catch (e) {
    console.error('Error initializing database', e);
    throw e;
  }

};

module.exports = init;
