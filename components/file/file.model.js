module.exports = (sequelize, type) => {
  return sequelize.define('archivos', {
    idarchivo: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: type.CHAR
    },
    urlfile: {
      type: type.TEXT
    }
        
  });
};