// src/index.ts
import express from 'express';
import bodyParser from 'body-parser';
import storeRoutes from './routes/store';
import auditRoutes from './routes/audit';
import sanctionsRoutes from './routes/sanctions';
import { PORT } from './config';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/store', storeRoutes);
app.use('/audit', auditRoutes);
app.use('/sanctions', sanctionsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Export the app for tests / other modules
export default app;

// If the file is run directly (node src/index.ts), start listening.
// This keeps behavior identical when run directly but allows tests to import app.
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`storage_audit running on port ${PORT}`);
  });
}
