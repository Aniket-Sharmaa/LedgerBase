// src/routes/auth.routes.js
import express from 'express';
import {userLoginController, userLogoutController, userRegisterController} from '../controllers/auth.controller.js';

const router = express.Router();


// POST /api/auth/register
router.post('/register',userRegisterController)

// POST /api/auth/login
router.post('/login', userLoginController)

/* 
post /api/auth/logout
*/
router.post('/logout', userLogoutController)


export default router;