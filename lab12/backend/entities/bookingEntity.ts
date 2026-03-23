import type { BookingStatus } from "../utils/bookingStatus.js";

export type BookingEntity = {
    id: string;
    user_id: string;
    workspace_id: string;
    start_time: Date;
    end_time: Date;
    total_hours: number;
    base_amount: number;
    discount_percent: number;
    final_amount: number;
    status: BookingStatus;
    created_at: Date;
};