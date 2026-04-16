// src/app.js

// Core and third-party imports
import express from 'express';
import cookieParser from 'cookie-parser';

// Route modules
import accountRouter from './routes/account.routes.js';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

// App instance
const app = express();

// Global middleware
app.use(cookieParser());
app.use(express.json());


app.get('/', (req,res)=> {
    res.send('LedgerBase is up and running')
})
// API route registration
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRoutes);

// App export for server bootstrap
export default app;