import type { SubscriptionStatus } from "../utils/subscrriptionStatus.js";

export type SubscriptionEntity = {
    id: string;
    user_id: string;
    purchase_date: Date;
    activation_date: Date;
    expiry_date: Date;
    price: number;
    is_active: boolean;
    status: SubscriptionStatus;
};

