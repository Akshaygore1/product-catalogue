import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from '../logger';
import type { CatalogueService } from '../services/catalogue-service';
import type { EnquiryService } from '../services/enquiry-service';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { catalogueRouter } from './routes/catalogue';
import { enquiriesRouter } from './routes/enquiries';

export interface AppDependencies {
  logger: Logger;
  corsOrigins: string[];
  imageTimeoutMs: number;
  trustProxy?: boolean;
  catalogue: CatalogueService;
  enquiries: EnquiryService;
}

/** Builds the Express app from already-wired dependencies (no globals, easy to test). */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  // Enable only when the API is reachable exclusively through one trusted proxy.
  if (deps.trustProxy) app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger: deps.logger,
      genReqId: (req, res) => {
        const header = req.headers['x-request-id'];
        const id =
          typeof header === 'string' && /^[\w-]{1,64}$/.test(header) ? header : randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url === '/api/health' },
    }),
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cors({ origin: deps.corsOrigins }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const v1 = express.Router();
  v1.use(catalogueRouter(deps.catalogue, deps.imageTimeoutMs));
  v1.use(enquiriesRouter(deps.enquiries));
  app.use('/api/v1', v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
