require('dotenv').config();

const constants = {
  ENV:process.env.ENV,
  AZURE_STORAGE_CONNECTION_STRING:process.env.AZURE_STORAGE_CONNECTION_STRING,
  DB_USER:process.env.DB_USER,
  DB_PWD:process.env.DB_PWD,
  DB_PORT:process.env.DB_PORT,
  DB_HOST:process.env.DB_HOST,
  DB_DBNAME:process.env.DB_DBNAME
};

module.exports = constants;