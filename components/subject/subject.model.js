module.exports = (sequelize, type) => {
  return sequelize.define('materias', {
    idmateria: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    anio: {
      type: type.TEXT
    },
    nombre: {
      type: type.TEXT
    },
    idcarrera: {
      type: type.INTEGER
    }
  });
};