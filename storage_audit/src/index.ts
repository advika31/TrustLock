// src/index.ts
import express from 'express';
import bodyParser from 'body-parser';
import storeRoutes from './routes/store';
import auditRoutes from './routes/audit';
import sanctionsRoutes from './routes/sanctions';
import cron from 'node-cron';
import { createMerkleSnapshot } from './lib/merkle';
import { PORT } from './config';
import merkleRoutes from './routes/merkle';
import webhookRoutes from './routes/webhooks';
import eventRoutes from './routes/events';

cron.schedule('0 * * * *', async () => { // every hour on the hour
  try {
    const s = await createMerkleSnapshot();
    console.log('Merkle snapshot created', s);
  } catch (e) {
    console.error('Merkle snapshot failed', e);
  }
});

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/store', storeRoutes);
app.use('/audit', auditRoutes);
app.use('/sanctions', sanctionsRoutes);

app.use('/merkle', merkleRoutes);
app.use('/webhook', webhookRoutes);
app.use('/events', eventRoutes);

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
