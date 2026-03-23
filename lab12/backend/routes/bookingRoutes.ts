import { Router } from 'express';
import { BookingController } from '../controllers/bookingController.js';

export const createBookingRouter = (bookingController: BookingController) => {
    const router = Router();

    /**
     * @swagger
     * /api/bookings:
     *   post:
     *     summary: Створити нове бронювання
     *     description: Бронювання робочого місця на певний час
     *     tags: [Bookings]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *               - workspace_id
     *               - start_time
     *               - end_time
     *             properties:
     *               user_id:
     *                 type: string
     *                 format: uuid
     *                 description: ID користувача
     *                 example: "123e4567-e89b-12d3-a456-426614174000"
     *               workspace_id:
     *                 type: string
     *                 format: uuid
     *                 description: ID робочого місця
     *                 example: "123e4567-e89b-12d3-a456-426614174001"
     *               start_time:
     *                 type: string
     *                 format: date-time
     *                 description: Час початку
     *                 example: "2024-01-20T10:00:00Z"
     *               end_time:
     *                 type: string
     *                 format: date-time
     *                 description: Час закінчення
     *                 example: "2024-01-20T18:00:00Z"
     *     responses:
     *       201:
     *         description: Бронювання створено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Booking'
     *       400:
     *         description: Помилка валідації або конфлікт часу
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Користувача або робоче місце не знайдено
     */
    router.post('/', bookingController.createBooking);

    /**
     * @swagger
     * /api/bookings:
     *   get:
     *     summary: Отримати всі бронювання
     *     description: Повертає список всіх бронювань
     *     tags: [Bookings]
     *     responses:
     *       200:
     *         description: Список бронювань
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
     *                     $ref: '#/components/schemas/Booking'
     */
    router.get('/', bookingController.getAllBookings);

    /**
     * @swagger
     * /api/bookings/{id}:
     *   get:
     *     summary: Отримати бронювання за ID
     *     tags: [Bookings]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID бронювання
     *     responses:
     *       200:
     *         description: Бронювання знайдено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Booking'
     *       404:
     *         description: Бронювання не знайдено
     */
    router.get('/:id', bookingController.getBookingById);

    /**
     * @swagger
     * /api/bookings/{id}/cancel:
     *   post:
     *     summary: Скасувати бронювання
     *     description: Скасовує бронювання (доступно протягом 48 годин після створення)
     *     tags: [Bookings]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID бронювання
     *     responses:
     *       200:
     *         description: Бронювання скасовано
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Booking'
     *       400:
     *         description: Неможливо скасувати (минуло більше 48 годин)
     *       404:
     *         description: Бронювання не знайдено
     */
    router.post('/:id/cancel', bookingController.cancelBooking);

    /**
     * @swagger
     * /api/bookings/{id}/pay:
     *   post:
     *     summary: Позначити бронювання як оплачене
     *     tags: [Bookings]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: ID бронювання
     *     responses:
     *       200:
     *         description: Бронювання оплачено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Booking'
     *       400:
     *         description: Неможливо оплатити
     *       404:
     *         description: Бронювання не знайдено
     */
    router.post('/:id/pay', bookingController.markAsPaid);

    /**
     * @swagger
     * /api/bookings/user/{userId}:
     *   get:
     *     summary: Отримати бронювання користувача
     *     description: Повертає всі бронювання конкретного користувача
     *     tags: [Bookings]
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
     *         description: Список бронювань користувача
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
     *                     $ref: '#/components/schemas/Booking'
     *       404:
     *         description: Користувача не знайдено
     */
    router.get('/user/:userId', bookingController.getUserBookings);

    return router;
};