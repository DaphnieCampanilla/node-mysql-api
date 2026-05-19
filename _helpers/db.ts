import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize();

async function initialize() {
    const host = process.env.DB_HOST || config.database.host;
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : config.database.port;
    const user = process.env.DB_USER || config.database.user;
    const password = process.env.DB_PASSWORD || config.database.password;
    const database = process.env.DB_NAME || config.database.database;

    const isProduction = process.env.NODE_ENV === 'production';

    // Connection options for mysql2
    const connectionOptions: any = { host, port, user, password };
    if (isProduction) {
        // Cloud providers often require SSL
        connectionOptions.ssl = { rejectUnauthorized: false };
    }

    const connection = await mysql.createConnection(connectionOptions);
    
    // Create DB if it doesn't already exist (may fail on cloud DBs due to permissions)
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    } catch (err: any) {
        console.log(`Note: Could not automatically create database. Assuming it already exists. (${err.message})`);
    }

    // Connect to the database with Sequelize ORM
    const sequelizeOptions: any = { host, port, dialect: 'mysql' };
    if (isProduction) {
        sequelizeOptions.dialectOptions = {
            ssl: { rejectUnauthorized: false }
        };
    }
    const sequelize = new Sequelize(database, user, password, sequelizeOptions);

    // Initialize the Account and Refresh Token models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Define the one-to-many relationship
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Automatically create tables in MySQL if they don't exist
    await sequelize.sync();
}

