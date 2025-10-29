import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinTrackr API',
      version: '1.0.0',
      description: 'Personal Finance Tracker API Documentation',
      contact: {
        name: 'FinTrackr Team',
        email: 'support@fintrackr.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      },
      {
        url: 'https://api.fintrackr.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
            amount: { type: 'number', format: 'decimal' },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            color: { type: 'string', format: 'hex' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
