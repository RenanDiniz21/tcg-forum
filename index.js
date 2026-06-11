const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const app = require('./backend/src/app');

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = app;
