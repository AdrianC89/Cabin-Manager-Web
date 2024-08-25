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
    type: DataTypes.DATEONLY, 
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATEONLY, 
    allowNull: false,
  },
  dias: {
    type: DataTypes.VIRTUAL, 
    get() {
      const fechaInicio = new Date(this.fecha_inicio);
      const fechaFin = new Date(this.fecha_fin);
      const diffTime = Math.abs(fechaFin - fechaInicio);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
    }
  },
  costo_total: {
    type: DataTypes.VIRTUAL, 
    async get() {
      const cabana = await Cabana.findByPk(this.cabana_numero);
      if (cabana) {
        return this.dias * cabana.costo_diario;
      }
      return null;
    }
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
  timestamps: false,
  hooks: {
    beforeSave: async (reserva) => {
      const fechaInicio = new Date(reserva.fecha_inicio);
      const fechaFin = new Date(reserva.fecha_fin);
      const diffTime = Math.abs(fechaFin - fechaInicio);
      reserva.dataValues.dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const cabana = await Cabana.findByPk(reserva.cabana_numero);
      if (cabana) {
        reserva.dataValues.costo_total = reserva.dataValues.dias * cabana.costo_diario;
      }
    }
  }
});

// Definir las asociaciones
Cliente.hasMany(Reserva, { foreignKey: 'cliente_dni' });
Reserva.belongsTo(Cliente, { foreignKey: 'cliente_dni' });

Cabana.hasMany(Reserva, { foreignKey: 'cabana_numero' });
Reserva.belongsTo(Cabana, { foreignKey: 'cabana_numero' });

export default Reserva;
