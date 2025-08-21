require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Conectado a MongoDB');
    }
  })
  .catch(err => console.error('Error en conexión MongoDB:', err));

module.exports = mongoose;
