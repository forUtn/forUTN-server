module.exports = (sequelize, type) => {
  return sequelize.define('perfiles_rutas', {
    idruta: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    idperfil: {
      type: type.BIGINT
    },
    ruta: {
      type: type.TEXT
    }
  });
};