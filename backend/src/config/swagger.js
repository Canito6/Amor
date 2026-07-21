const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'O Nosso Cantinho ❤️ API',
      version: '1.0.0',
      description: 'API RESTful interativa para o portal de casais O Nosso Cantinho',
      contact: {
        name: 'O Nosso Cantinho Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor Local de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
