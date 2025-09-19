module.exports = (sequelize, type) => {
  return sequelize.define('usuarios', {
    idusuario: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    idperfil: {
      type: type.BIGINT
    },
    idcarrera: {
      type: type.BIGINT
    },
    username: {
      type: type.TEXT
    },
    pwd: {
      type: type.TEXT
    },
    mail: {
      type: type.TEXT
    }
        
  });
};