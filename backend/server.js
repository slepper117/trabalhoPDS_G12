import app from './app.js';
import logger from './config/winston.js';

const port = process.env.PORT;
const domain = process.env.DOMAIN;

// App Server
app.listen(port, () =>
  logger.info(`A aplicação esta a funcionar em ${domain}:${port}`)
);
