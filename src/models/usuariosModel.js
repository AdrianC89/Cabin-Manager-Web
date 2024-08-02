import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  foto_perfil: {
    type: DataTypes.STRING, // URL de la foto de perfil
    allowNull: true,
  }
}, {
  tableName: 'Usuarios',
  timestamps: false
});

export default Usuario;
