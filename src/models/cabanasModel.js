import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Cabana = sequelize.define('Cabana', {
  numero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  costo_diario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: 'Cabanas',
  timestamps: false
});

export default Cabana;