import {Router} from 'express';
import { authMiddleware, authSystemUserMiddleware } from '../middleware/auth.middleware.js';
import { createInitialFundsTransaction, createTransaction } from '../controllers/transaction.controller.js';
const transactionRoutes = Router();


// POST /api/transactions/ - Create a new transaction
transactionRoutes.post('/',authMiddleware ,createTransaction)
transactionRoutes.post('/system/initial-funds', authSystemUserMiddleware, createInitialFundsTransaction)


export default transactionRoutes;