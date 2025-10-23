import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/config/swagger';

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FinTrackr API Documentation'
  }));
};
