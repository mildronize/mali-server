import 'reflect-metadata'; // for decorator
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
// import { addExpressController } from './router';
import errorMiddleware from './error.middleware';

import { vars, logger } from './config';

import { Connection, createConnection, useContainer, Container } from 'typeorm-di';
import { addExpressController } from 'route-controller';

class App {
  public app: express.Application;
  public port: string | number;
  public isProduction: boolean;
  // public connection: Connection

  constructor(controllers: any[]) {
    this.app = express();
    this.port = vars.port || 3000;
    this.isProduction = vars.env === 'production' ? true : false;

    this.initApp(controllers);
  }

  private async initApp(controllers: any[]) {
    this.initializeMiddlewares();
    await this.initializeDatabase();
    logger.info('Connected to the database');

    addExpressController(this.app, controllers);
    this.initializeSwagger();
    this.initializeErrorHandling();
    logger.info('The server is successfully started.');
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`🚀 App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    if (this.isProduction) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan('combined'));
      this.app.use(cors({ origin: 'your.domain.com', credentials: true }));
    } else {
      this.app.use(morgan('dev'));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeSwagger() {
    const swaggerJSDoc = require('swagger-jsdoc');
    const swaggerUi = require('swagger-ui-express');

    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/docs/api', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeDatabase(): Promise<Connection> {
    // Import all entity
    useContainer(Container);
    const connection = createConnection({
      name: 'default',
      type: 'sqlite',
      database: './app.sqlite',
      synchronize: true,
      entities: ['**/*.entity.ts'],
    });

    return connection;
  }
}

export default App;
