import express from 'express';
import { authMiddleware } from "../middleware/auth.middleware.js";
import {createAccount, getAccountBalanceController, getUserAccountController} from "../controllers/acount.controller.js";
const router = express.Router();


/* 
- POST /api/accounts/
- Create a new account
- Protected route
*/
router.post('/', authMiddleware, createAccount)
/* 
GET /api/accounts
Get all the accounts of the logged in user
Protected Route
*/
router.get('/', authMiddleware, getUserAccountController)
/* 
GET /api/accounts/balance/:accountId
-
*/
router.get('/balance/:accountId', authMiddleware, getAccountBalanceController)

export default router;