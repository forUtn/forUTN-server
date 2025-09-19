module.exports = (sequelize, type) => {
  return sequelize.define('carreras', {
    idcarrera: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: type.TEXT
    },
    url: {
      type: type.TEXT
    }
  });
};