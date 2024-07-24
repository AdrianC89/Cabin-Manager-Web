import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';
import Cliente from './clientesModel.js';
import Cabana from './cabanasModel.js';

const Reserva = sequelize.define('Reserva', {
  numero_reserva: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cliente_dni: {
    type: DataTypes.INTEGER,
    references: {
      model: Cliente,
      key: 'dni'
    }
  },
  cabana_numero: {
    type: DataTypes.INTEGER,
    references: {
      model: Cabana,
      key: 'numero'
    }
  }
}, {
  tableName: 'Reservas',
  timestamps: false
});

// Definir las asociaciones
Cliente.hasMany(Reserva, { foreignKey: 'cliente_dni' });
Reserva.belongsTo(Cliente, { foreignKey: 'cliente_dni' });

Cabana.hasMany(Reserva, { foreignKey: 'cabana_numero' });
Reserva.belongsTo(Cabana, { foreignKey: 'cabana_numero' });

export default Reserva;