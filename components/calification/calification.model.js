module.exports = (sequelize, type) => {
  return sequelize.define('calificaciones', {
    idcalificacion: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    idusuario: {
      type: type.BIGINT
    },
    identrada: {
      type: type.BIGINT
    },
    tipoclasificacion: {
      type: type.TEXT
    }
  });
};