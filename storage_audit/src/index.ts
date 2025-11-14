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

app.listen(PORT, () => {
  console.log(`storage_audit running on port ${PORT}`);
});
