import type { BookingEntity } from "../entities/bookingEntity.ts";
import type { CreateBookingModel } from "../models/createBookingModel.ts";
import { UserService } from "./userService.js";
import { WorkspaceService } from "./workspaceService.js";
import { v4 as uuidv4 } from 'uuid';
import { BookingStatus } from "../utils/bookingStatus.js";

export class BookingService {
    private bookings: Map<string, BookingEntity> = new Map();

    constructor(
        private userService: UserService,
        private workspaceService: WorkspaceService
    ) {}

    createBooking(data: CreateBookingModel): BookingEntity {
        // 1. Перевірка існування користувача
        const user = this.userService.getUserById(data.user_id);
        if (!user) {
            throw new Error("Користувача не знайдено");
        }

        // 2. Перевірка існування робочого місця
        const workspace = this.workspaceService.getWorkspaceById(data.workspace_id);
        if (!workspace) {
            throw new Error("Робоче місце не знайдено");
        }

        // 3. Перевірка чи активне робоче місце
        if (!workspace.is_active) {
            throw new Error("Робоче місце недоступне для бронювання");
        }

        // 4. Валідація часу
        if (data.start_time >= data.end_time) {
            throw new Error("Час початку повинен бути меншим за час закінчення");
        }

        if (data.start_time < new Date()) {
            throw new Error("Не можна бронювати на час у минулому");
        }

        // 5. БЛ: Перевірка на перетин з існуючими бронюваннями
        const overlappingBooking = this.checkOverlapping(
            data.workspace_id,
            data.start_time,
            data.end_time
        );

        if (overlappingBooking) {
            throw new Error("Цей час вже заброньовано");
        }

        // 6. Розрахунки
        const totalHours = this.calculateTotalHours(data.start_time, data.end_time);
        const baseAmount = totalHours * workspace.price_per_hour;
        
        // 7. БЛ: Знижка 10% якщо бронювання > 4 годин
        const discountPercent = totalHours > 4 ? 10 : 0;
        const finalAmount = baseAmount * (1 - discountPercent / 100);

        // 8. Створення бронювання
        const booking: BookingEntity = {
            id: uuidv4(),
            user_id: data.user_id,
            workspace_id: data.workspace_id,
            start_time: data.start_time,
            end_time: data.end_time,
            total_hours: totalHours,
            base_amount: baseAmount,
            discount_percent: discountPercent,
            final_amount: finalAmount,
            status: BookingStatus.unpaid,
            created_at: new Date()
        };

        this.bookings.set(booking.id, booking);
        return booking;
    }

    cancelBooking(id: string, userId: string): BookingEntity | undefined {
        const booking = this.bookings.get(id);
        
        if (!booking) {
            throw new Error("Бронювання не знайдено");
        }

        // Перевірка чи користувач є власником бронювання
        if (booking.user_id !== userId) {
            throw new Error("Ви не можете скасувати чуже бронювання");
        }

        // БЛ: Перевірка чи можна скасувати (менше 2 годин до початку)
        const now = new Date();
        const hoursUntilStart = (booking.start_time.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilStart < 2 && hoursUntilStart > 0) {
            throw new Error("Не можна скасувати бронювання менш ніж за 2 години до початку");
        }

        // БЛ: Якщо бронювання вже розпочалось, скасувати не можна
        if (now > booking.start_time) {
            throw new Error("Не можна скасувати бронювання, яке вже розпочалось");
        }

        booking.status = BookingStatus.cancelled;
        this.bookings.set(id, booking);
        
        return booking;
    }

    markAsPaid(id: string): BookingEntity | undefined {
        const booking = this.bookings.get(id);
        
        if (!booking) {
            throw new Error("Бронювання не знайдено");
        }

        if (booking.status !== BookingStatus.unpaid) {
            throw new Error("Бронювання вже оплачене або скасоване");
        }

        booking.status = BookingStatus.active;
        this.bookings.set(id, booking);
        
        return booking;
    }

    // БЛ: Автоматичне скасування прострочених бронювань (викликається по таймеру)
    cancelOverdueBookings(): void {
        const now = new Date();
        
        Array.from(this.bookings.values()).forEach(booking => {
            if (booking.status === BookingStatus.unpaid) {
                const hoursSinceCreation = (now.getTime() - booking.created_at.getTime()) / (1000 * 60 * 60);
                
                // БЛ: Скасування через 48 годин без оплати
                if (hoursSinceCreation > 48) {
                    booking.status = BookingStatus.cancelled;
                    this.bookings.set(booking.id, booking);
                    console.log(`Бронювання ${booking.id} скасовано автоматично (не сплачено протягом 48 годин)`);
                }
            }
        });
    }

    // БЛ: Завершення активних бронювань після закінчення часу
    completeExpiredBookings(): void {
        const now = new Date();
        
        Array.from(this.bookings.values()).forEach(booking => {
            if (booking.status === BookingStatus.active && now > booking.end_time) {
                booking.status = BookingStatus.completed;
                this.bookings.set(booking.id, booking);
            }
        });
    }

    getBookingById(id: string): BookingEntity | undefined {
        return this.bookings.get(id);
    }

    getUserBookings(userId: string): BookingEntity[] {
        return Array.from(this.bookings.values()).filter(b => b.user_id === userId);
    }

    getAllBookings(): BookingEntity[] {
        return Array.from(this.bookings.values());
    }

    // Приватні допоміжні методи
    private checkOverlapping(workspaceId: string, start: Date, end: Date): boolean {
        return Array.from(this.bookings.values()).some(booking => {
            if (booking.workspace_id !== workspaceId) return false;
            if (booking.status === BookingStatus.cancelled) return false;
            
            // Перевірка перетину часових інтервалів
            return (start < booking.end_time && end > booking.start_time);
        });
    }

    private calculateTotalHours(start: Date, end: Date): number {
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        // Округлення до 2 знаків після коми
        return Math.round(diffHours * 100) / 100;
    }
}