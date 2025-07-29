// routes/webhook.routes.js
import express from 'express';
import { handleChapaWebhook } from '../controller/webhook/webhook.controller.js';

const router = express.Router();

router.post('/chapa', handleChapaWebhook);

export default router;
