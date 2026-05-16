import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import logger from './utilities/logger';
import { requestLogger, resourceNotFound, errorHandling } from './middlewares';
import routes from './controllers';
import swaggerConfig from './swagger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  const now = new Date();

  res.send({
    status: 'ok',
    message: '🚀 Server Up and Running! ✅',
    timestamp: now.toLocaleString()
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use('/api', routes);

app.use(resourceNotFound);
app.use(errorHandling);

app.listen(config.port, () => {
  logger.info(`🚀 Server Up and Running on port ${config.port}! ✅`);
  logger.info(`Swagger docs at http://localhost:${config.port}/api-docs`);
});

export default app;
