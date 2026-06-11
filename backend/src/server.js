require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor', err);
    process.exit(1);
  }
}

start();
