//IMPORTANTE! SOLO INICIAR "node .\src\sync.js" SI SE NECESITA ACTUALIZAR ALGUNA TABLA, SINO NO HACE FALTA.

import sequelize from './src/database/connect.js';
import './src/models/cabanasModel.js';
import './src/models/clientesModel.js';
import './src/models/reservasModel.js';

sequelize.sync({ force: true }).then(() => {
    console.log("Database & tables created!");
  });