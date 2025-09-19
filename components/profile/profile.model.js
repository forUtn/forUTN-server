module.exports = (sequelize, type) => {
  return sequelize.define('perfiles', {
    idperfil: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nombreperfil: {
      type: type.TEXT
    }
  });
};
