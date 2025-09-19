module.exports = (sequelize, type) => {
  return sequelize.define('rel_entradas_archivos', {
    id: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    idarchivo: {
      type: type.BIGINT
    },
    identrada: {
      type: type.BIGINT
    }
  });
};