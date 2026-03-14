import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';

export const createSubscriptionRouter = (subscriptionController: SubscriptionController) => {
    const router = Router();

    /**
     * @swagger
     * /api/subscriptions:
     *   post:
     *     summary: Оформити абонемент
     *     description: Створює новий абонемент для користувача
     *     tags: [Subscriptions]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *             properties:
     *               user_id:
     *                 type: string
     *                 format: uuid
     *                 description: ID користувача
     *                 example: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       201:
     *         description: Абонемент оформлено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Subscription'
     *       400:
     *         description: Помилка валідації
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Користувача не знайдено
     *       409:
     *         description: Користувач вже має активний абонемент
     */
    router.post('/', subscriptionController.createSubscription);

    /**
     * @swagger
     * /api/subscriptions:
     *   get:
     *     summary: Отримати всі абонементи
     *     description: Повертає список всіх абонементів
     *     tags: [Subscriptions]
     *     responses:
     *       200:
     *         description: Список абонементів
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
     *                     $ref: '#/components/schemas/Subscription'
     */
    router.get('/', subscriptionController.getAllSubscriptions);

    /**
     * @swagger
     * /api/subscriptions/{id}:
     *   get:
     *     summary: Отримати абонемент за ID
     *     tags: [Subscriptions]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID абонемента
     *     responses:
     *       200:
     *         description: Абонемент знайдено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Subscription'
     *       404:
     *         description: Абонемент не знайдено
     */
    router.get('/:id', subscriptionController.getSubscriptionById);

    /**
     * @swagger
     * /api/subscriptions/user/{userId}:
     *   get:
     *     summary: Отримати всі абонементи користувача
     *     description: Повертає історію абонементів користувача
     *     tags: [Subscriptions]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID користувача
     *     responses:
     *       200:
     *         description: Список абонементів користувача
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
     *                     $ref: '#/components/schemas/Subscription'
     */
    router.get('/user/:userId', subscriptionController.getUserSubscriptions);

    /**
     * @swagger
     * /api/subscriptions/user/{userId}/active:
     *   get:
     *     summary: Отримати активний абонемент користувача
     *     description: Повертає поточний активний абонемент користувача (якщо є)
     *     tags: [Subscriptions]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID користувача
     *     responses:
     *       200:
     *         description: Активний абонемент (або null, якщо немає)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   oneOf:
     *                     - $ref: '#/components/schemas/Subscription'
     *                     - type: 'null'
     */
    router.get('/user/:userId/active', subscriptionController.getActiveUserSubscription);

    return router;
};