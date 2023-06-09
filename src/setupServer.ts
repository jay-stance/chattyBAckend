import { Application, urlencoded, json, Response, Request, NextFunction } from 'express';
import http from 'http';

// standard middlewares
import compression from 'compression';

// security packages
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';

// error handling packages
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';

// socket and redis
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { RedisAdapter, createAdapter } from '@socket.io/redis-adapter';

import { config } from './config';
import ApplicationRoutes from './routes';
import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';

const SERVER_PORT = 8000;
const logger = config.createLogger('setup-Server');

export class ChattyServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMidleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRECT_KEY_ONE, config.SECRECT_KEY_TWO],
        maxAge: 7 * 24 * 3600,
        secure: config.NODE_ENV === 'development'
      })
    );
    app.use(
      cors({
        origin: config.CLIENT_URL,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true
      })
    );
    app.use(helmet());
    app.use(hpp());
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMidleware(app: Application): void {
    ApplicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found on server` });
    });

    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      logger.error(error);
      if (error instanceof CustomError) return res.status(error.statusCose).json(error.serializeErrors());
    });
  }

  public async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.socketIOConnections(socketIO);

      this.startHttpServer(httpServer);
    } catch (e) {
      logger.error(e);
    }
  }

  public async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  public startHttpServer(httpServer: http.Server): void {
    logger.info(`server has started with process ${process.pid}`);

    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Server listening on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {}
}
