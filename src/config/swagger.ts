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
        email: 'support@fintrackr.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.fintrackr.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
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
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            color: { type: 'string', format: 'hex' },
          },
        },
        Card: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            type: {
              type: 'string',
              enum: ['VISA', 'MASTERCARD', 'RUPAY', 'MAESTRO'],
              description: 'Card network type',
              example: 'VISA',
            },
            holder: { type: 'string', example: 'John Doe' },
            number: { type: 'string', example: '1234 5678 9012 3456' },
            expiry: { type: 'string', example: '12/26' },
            balance: { type: 'number', example: 5000 },
            status: {
              type: 'string',
              enum: ['active', 'blocked', 'expired'],
              example: 'active',
            },
            bank: { type: 'string', example: 'HDFC Bank' },
            gradient: { type: 'string', example: 'from-blue-500 to-purple-600' },
            border: { type: 'string', example: 'border-blue-500' },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-12T12:00:00Z',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
