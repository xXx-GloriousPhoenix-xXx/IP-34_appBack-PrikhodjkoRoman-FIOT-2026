import { Op } from 'sequelize';
import type { BookingEntity } from '../entities/bookingEntity.js';
import type { CreateBookingModel } from '../models/createBookingModel.js';
import { BookingModel } from '../database/index.js';
import { UserService } from './userService.js';
import { WorkspaceService } from './workspaceService.js';
import { BookingStatus } from '../utils/bookingStatus.js';

export class BookingService {
    constructor(
        private userService: UserService,
        private workspaceService: WorkspaceService
    ) {}

    async createBooking(data: CreateBookingModel): Promise<BookingEntity> {
        // 1. Перевірка існування користувача
        const user = await this.userService.getUserById(data.user_id);
        if (!user) throw new Error('Користувача не знайдено');

        // 2. Перевірка існування робочого місця
        const workspace = await this.workspaceService.getWorkspaceById(data.workspace_id);
        if (!workspace) throw new Error('Робоче місце не знайдено');

        // 3. Перевірка чи активне робоче місце
        if (!workspace.is_active) throw new Error('Робоче місце недоступне для бронювання');

        // 4. Валідація часу
        if (data.start_time >= data.end_time) {
            throw new Error('Час початку повинен бути меншим за час закінчення');
        }
        if (data.start_time < new Date()) {
            throw new Error('Не можна бронювати на час у минулому');
        }

        // 5. БЛ: Перевірка на перетин з існуючими бронюваннями
        const overlapping = await BookingModel.findOne({
            where: {
                workspace_id: data.workspace_id,
                status: { [Op.not]: BookingStatus.cancelled },
                start_time: { [Op.lt]: data.end_time },
                end_time: { [Op.gt]: data.start_time },
            },
        });
        if (overlapping) throw new Error('Цей час вже заброньовано');

        // 6. Розрахунки
        const totalHours = this.calculateTotalHours(data.start_time, data.end_time);
        const baseAmount = totalHours * workspace.price_per_hour;

        // 7. БЛ: Знижка 10% якщо бронювання > 4 годин
        const discountPercent = totalHours > 4 ? 10 : 0;
        const finalAmount = baseAmount * (1 - discountPercent / 100);

        // 8. Створення бронювання
        const booking = await BookingModel.create({
            user_id: data.user_id,
            workspace_id: data.workspace_id,
            start_time: data.start_time,
            end_time: data.end_time,
            total_hours: totalHours,
            base_amount: baseAmount,
            discount_percent: discountPercent,
            final_amount: finalAmount,
            status: BookingStatus.unpaid,
        });

        return booking.toJSON() as BookingEntity;
    }

    async cancelBooking(id: string, userId: string): Promise<BookingEntity> {
        const booking = await BookingModel.findByPk(id);
        if (!booking) throw new Error('Бронювання не знайдено');

        if (booking.user_id !== userId) {
            throw new Error('Ви не можете скасувати чуже бронювання');
        }

        const now = new Date();
        const hoursUntilStart =
            (booking.start_time.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilStart < 2 && hoursUntilStart > 0) {
            throw new Error('Не можна скасувати бронювання менш ніж за 2 години до початку');
        }
        if (now > booking.start_time) {
            throw new Error('Не можна скасувати бронювання, яке вже розпочалось');
        }

        booking.status = BookingStatus.cancelled;
        await booking.save();
        return booking.toJSON() as BookingEntity;
    }

    async markAsPaid(id: string): Promise<BookingEntity> {
        const booking = await BookingModel.findByPk(id);
        if (!booking) throw new Error('Бронювання не знайдено');

        if (booking.status !== BookingStatus.unpaid) {
            throw new Error('Бронювання вже оплачене або скасоване');
        }

        booking.status = BookingStatus.active;
        await booking.save();
        return booking.toJSON() as BookingEntity;
    }

    // БЛ: Автоматичне скасування прострочених бронювань (викликається по таймеру)
    async cancelOverdueBookings(): Promise<void> {
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const [count] = await BookingModel.update(
            { status: BookingStatus.cancelled },
            {
                where: {
                    status: BookingStatus.unpaid,
                    created_at: { [Op.lt]: cutoff },
                },
            }
        );

        if (count > 0) {
            console.log(`Auto-cancelled ${count} unpaid booking(s) older than 48h`);
        }
    }

    // БЛ: Завершення активних бронювань після закінчення часу
    async completeExpiredBookings(): Promise<void> {
        const now = new Date();

        await BookingModel.update(
            { status: BookingStatus.completed },
            {
                where: {
                    status: BookingStatus.active,
                    end_time: { [Op.lt]: now },
                },
            }
        );
    }

    async getBookingById(id: string): Promise<BookingEntity | null> {
        const booking = await BookingModel.findByPk(id);
        return booking ? (booking.toJSON() as BookingEntity) : null;
    }

    async getUserBookings(userId: string): Promise<BookingEntity[]> {
        const bookings = await BookingModel.findAll({ where: { user_id: userId } });
        return bookings.map(b => b.toJSON() as BookingEntity);
    }

    async getAllBookings(): Promise<BookingEntity[]> {
        const bookings = await BookingModel.findAll();
        return bookings.map(b => b.toJSON() as BookingEntity);
    }

    private calculateTotalHours(start: Date, end: Date): number {
        const diffMs = end.getTime() - start.getTime();
        return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }
}