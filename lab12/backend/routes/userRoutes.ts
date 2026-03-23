import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

export const createUserRouter = (userController: UserController) => {
    const router = Router();

    /**
     * @swagger
     * /api/users:
     *   post:
     *     summary: Створити нового користувача
     *     description: Реєстрація нового користувача в системі
     *     tags: [Users]
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
     *             properties:
     *               full_name:
     *                 type: string
     *                 description: Повне ім'я користувача
     *                 example: "Іван Петренко"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Електронна пошта
     *                 example: "ivan@mail.com"
     *               phone:
     *                 type: string
     *                 description: Номер телефону
     *                 example: "+380991234567"
     *               age:
     *                 type: integer
     *                 minimum: 16
     *                 description: Вік користувача (мінімум 16 років)
     *                 example: 25
     *     responses:
     *       201:
     *         description: Користувача успішно створено
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
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     full_name:
     *                       type: string
     *                     email:
     *                       type: string
     *                     phone:
     *                       type: string
     *                     age:
     *                       type: integer
     *                     registration_date:
     *                       type: string
     *                       format: date-time
     *                     has_debt:
     *                       type: boolean
     *       400:
     *         description: Помилка валідації
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 error:
     *                   type: string
     */
    router.post('/', userController.createUser);

    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Отримати всіх користувачів
     *     description: Повертає список всіх зареєстрованих користувачів
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: Список користувачів
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       full_name:
     *                         type: string
     *                       email:
     *                         type: string
     *                       phone:
     *                         type: string
     *                       age:
     *                         type: integer
     *                       registration_date:
     *                         type: string
     *                         format: date-time
     *                       has_debt:
     *                         type: boolean
     */
    router.get('/', userController.getAllUsers);

    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Отримати користувача за ID
     *     description: Повертає детальну інформацію про конкретного користувача
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Унікальний ідентифікатор користувача
     *         example: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Користувача знайдено
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
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     full_name:
     *                       type: string
     *                     email:
     *                       type: string
     *                     phone:
     *                       type: string
     *                     age:
     *                       type: integer
     *                     registration_date:
     *                       type: string
     *                       format: date-time
     *                     has_debt:
     *                       type: boolean
     *       404:
     *         description: Користувача не знайдено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: false
     *                 error:
     *                   type: string
     *                   example: "Користувача не знайдено"
     */
    router.get('/:id', userController.getUserById);

    return router;
};