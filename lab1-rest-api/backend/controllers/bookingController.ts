import type { Request, Response } from 'express';
import { BookingService } from '../services/bookingService.js';

export class BookingController {
    constructor(private bookingService: BookingService) {}

    createBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id, workspace_id, start_time, end_time } = req.body;

            if (!user_id || !workspace_id || !start_time || !end_time) {
                res.status(400).json({
                    success: false,
                    error: 'Необхідно вказати user_id, workspace_id, start_time та end_time'
                });
                return;
            }

            if (typeof user_id !== 'string' || typeof workspace_id !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'user_id та workspace_id мають бути рядками'
                });
                return;
            }

            const bookingData = {
                user_id,
                workspace_id,
                start_time: new Date(start_time),
                end_time: new Date(end_time)
            };

            if (isNaN(bookingData.start_time.getTime()) || isNaN(bookingData.end_time.getTime())) {
                res.status(400).json({ success: false, error: 'Невірний формат дати' });
                return;
            }

            const booking = await this.bookingService.createBooking(bookingData);
            res.status(201).json({ success: true, data: booking });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    cancelBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({ success: false, error: 'ID бронювання має бути рядком' });
                return;
            }

            if (!userId || typeof userId !== 'string') {
                res.status(400).json({ success: false, error: 'userId має бути рядком' });
                return;
            }

            const booking = await this.bookingService.cancelBooking(id, userId);
            res.json({ success: true, data: booking });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    markAsPaid = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({ success: false, error: 'ID бронювання має бути рядком' });
                return;
            }

            const booking = await this.bookingService.markAsPaid(id);
            res.json({ success: true, data: booking });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getBookingById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({ success: false, error: 'ID бронювання має бути рядком' });
                return;
            }

            const booking = await this.bookingService.getBookingById(id);

            if (!booking) {
                res.status(404).json({ success: false, error: 'Бронювання не знайдено' });
                return;
            }

            res.json({ success: true, data: booking });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getUserBookings = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;

            if (typeof userId !== 'string' || !userId) {
                res.status(400).json({ success: false, error: 'ID користувача має бути рядком' });
                return;
            }

            const bookings = await this.bookingService.getUserBookings(userId);
            res.json({ success: true, data: bookings });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getAllBookings = async (_req: Request, res: Response): Promise<void> => {
        try {
            const bookings = await this.bookingService.getAllBookings();
            res.json({ success: true, data: bookings });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}