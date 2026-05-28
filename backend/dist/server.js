import express from 'express';
import cors from 'cors';
import { config } from './src/config/index.js';
import { requestLogger } from './src/middleware/requestLogger.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { optionalAuth } from './src/middleware/auth.js';
import { healthRouter } from './src/routes/health.js';
import { extractRouter } from './src/routes/extract.js';
import { generateRouter } from './src/routes/generate.js';
import { analyzeRouter } from './src/routes/analyze.js';
import { historyRouter } from './src/routes/history.js';
const app = express();
const PORT = config.port;
// Mount colored/JSON request logging middleware
app.use(requestLogger);
// Enable CORS for frontend proxying and stand-alone request testing
app.use(cors());
// Configure high body limits to support direct base64 image uploads for analysis
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Parse Supabase JWT tokens globally to expose user states
app.use(optionalAuth);
// Routing mounts
app.use('/api/health', healthRouter);
app.use('/api/extract', extractRouter);
app.use('/api/generate', generateRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);
// Global unified error handling (must be mounted last)
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Vignette.ai Express server is running on port ${PORT} `);
    console.log(` Language: TypeScript (ESM NodeNext via tsx) `);
    console.log(` Environment: ${config.nodeEnv} `);
    console.log(` Health: http://localhost:${PORT}/api/health `);
    console.log(`====================================================`);
});
