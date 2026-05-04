import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const createAuthRouter = (authController: AuthController) => {
    const router = Router();

    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Реєстрація нового користувача
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - full_name
     *               - email
     *               - phone
     *               - age
     *               - password
     *             properties:
     *               full_name:
     *                 type: string
     *                 example: "Іван Петренко"
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "ivan@mail.com"
     *               phone:
     *                 type: string
     *                 example: "+380991234567"
     *               age:
     *                 type: integer
     *                 example: 25
     *               password:
     *                 type: string
     *                 minLength: 6
     *                 example: "secret123"
     *     responses:
     *       201:
     *         description: Успішна реєстрація
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *       400:
     *         $ref: '#/components/schemas/Error'
     */
    router.post('/register', authController.register);

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Вхід у систему
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Успішний вхід
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *       401:
     *         $ref: '#/components/schemas/Error'
     */
    router.post('/login', authController.login);

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Отримати поточного користувача
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Дані поточного користувача
     *       401:
     *         $ref: '#/components/schemas/Error'
     */
    router.get('/me', authMiddleware, authController.me);

    return router;
};