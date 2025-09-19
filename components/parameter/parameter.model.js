module.exports = (sequelize, type) => {
  return sequelize.define('parametros', {
    idparametro: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: type.TEXT
    }
  });
};