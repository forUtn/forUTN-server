module.exports = (sequelize, type) => {
  return sequelize.define('logs', {
    idlog: {
      type: type.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idusuario: {
      type: type.BIGINT
    },
    descripcion: {
      type: type.TEXT
    }
  });
};