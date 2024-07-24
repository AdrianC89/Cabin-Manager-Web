import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Cliente = sequelize.define('Cliente', {
  dni: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING(255),
  },
  telefono: {
    type: DataTypes.STRING(15),
  },
  email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: true,
    },
  }
}, {
  tableName: 'Clientes',
  timestamps: false
});

export default Cliente;