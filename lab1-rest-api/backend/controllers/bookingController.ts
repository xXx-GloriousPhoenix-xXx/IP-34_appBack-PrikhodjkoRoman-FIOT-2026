import type { Request, Response } from 'express';
import { BookingService } from '../services/bookingService.js';

export class BookingController {
    constructor(private bookingService: BookingService) {}

    createBooking = (req: Request, res: Response): void => {
        try {
            const { user_id, workspace_id, start_time, end_time } = req.body;

            // Валідація обов'язкових полів
            if (!user_id || !workspace_id || !start_time || !end_time) {
                res.status(400).json({
                    success: false,
                    error: 'Необхідно вказати user_id, workspace_id, start_time та end_time'
                });
                return;
            }

            // Перевірка типів
            if (typeof user_id !== 'string' || typeof workspace_id !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'user_id та workspace_id мають бути рядками'
                });
                return;
            }

            // Конвертація рядків в Date об'єкти
            const bookingData = {
                user_id,
                workspace_id,
                start_time: new Date(start_time),
                end_time: new Date(end_time)
            };

            // Перевірка чи дати валідні
            if (isNaN(bookingData.start_time.getTime()) || isNaN(bookingData.end_time.getTime())) {
                res.status(400).json({
                    success: false,
                    error: 'Невірний формат дати'
                });
                return;
            }

            const booking = this.bookingService.createBooking(bookingData);
            res.status(201).json({
                success: true,
                data: booking
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    cancelBooking = (req: Request, res: Response): void => {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({
                    success: false,
                    error: 'ID бронювання має бути рядком'
                });
                return;
            }

            if (!userId || typeof userId !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'userId має бути рядком'
                });
                return;
            }

            const booking = this.bookingService.cancelBooking(id, userId);
            
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Бронювання не знайдено'
                });
                return;
            }
            
            res.json({
                success: true,
                data: booking
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    markAsPaid = (req: Request, res: Response): void => {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({
                    success: false,
                    error: 'ID бронювання має бути рядком'
                });
                return;
            }

            const booking = this.bookingService.markAsPaid(id);
            
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Бронювання не знайдено'
                });
                return;
            }
            
            res.json({
                success: true,
                data: booking
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    getBookingById = (req: Request, res: Response): void => {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({
                    success: false,
                    error: 'ID бронювання має бути рядком'
                });
                return;
            }

            const booking = this.bookingService.getBookingById(id);
            
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Бронювання не знайдено'
                });
                return;
            }
            
            res.json({
                success: true,
                data: booking
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    getUserBookings = (req: Request, res: Response): void => {
        try {
            const { userId } = req.params;

            if (typeof userId !== 'string' || !userId) {
                res.status(400).json({
                    success: false,
                    error: 'ID користувача має бути рядком'
                });
                return;
            }

            const bookings = this.bookingService.getUserBookings(userId);
            res.json({
                success: true,
                data: bookings
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    getAllBookings = (_req: Request, res: Response): void => {
        try {
            const bookings = this.bookingService.getAllBookings();
            res.json({
                success: true,
                data: bookings
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };
}