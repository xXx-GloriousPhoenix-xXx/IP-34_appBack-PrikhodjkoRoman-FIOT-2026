import type { SubscriptionEntity } from '../entities/subscriptionEntity.js';
import type { CreateSubscriptionModel } from '../models/createSubscriptionModel.js';
import { UserService } from './userService.js';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionStatus } from "../utils/subscrriptionStatus.js";

export class SubscriptionService {
    private subscriptions: Map<string, SubscriptionEntity> = new Map();

    constructor(private userService: UserService) {}

    createSubscription(data: CreateSubscriptionModel): SubscriptionEntity {
        // 1. Перевірка існування користувача
        const user = this.userService.getUserById(data.user_id);
        if (!user) {
            throw new Error("Користувача не знайдено");
        }

        // 2. БЛ: Перевірка наявності боргів
        if (user.has_debt) {
            throw new Error("Неможливо оформити абонемент: є активні борги");
        }

        // 3. БЛ: Перевірка чи немає вже активного абонемента
        const hasActiveSubscription = Array.from(this.subscriptions.values()).some(
            sub => sub.user_id === data.user_id && 
                   sub.status === SubscriptionStatus.active && 
                   sub.expiry_date > new Date()
        );

        if (hasActiveSubscription) {
            throw new Error("Користувач вже має активний абонемент");
        }

        // 4. Створення абонемента
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30 * data.months);

        const subscription: SubscriptionEntity = {
            id: uuidv4(),
            user_id: data.user_id,
            purchase_date: now,
            activation_date: now,
            expiry_date: expiryDate,
            price: data.price,
            is_active: true,
            status: SubscriptionStatus.active
        };

        this.subscriptions.set(subscription.id, subscription);
        return subscription;
    }

    // БЛ: Щоденне оновлення статусів абонементів
    updateSubscriptionsStatus(): void {
        const now = new Date();
        
        Array.from(this.subscriptions.values()).forEach(subscription => {
            if (subscription.status === SubscriptionStatus.active) {
                // Перевірка терміну дії
                if (now > subscription.expiry_date) {
                    subscription.status = SubscriptionStatus.expired;
                    subscription.is_active = false;
                    this.subscriptions.set(subscription.id, subscription);
                }
            }
        });
    }

    // БЛ: Блокування абонементу через борги
    blockSubscription(userId: string): void {
        const activeSubscription = this.getActiveUserSubscription(userId);
        
        if (activeSubscription) {
            activeSubscription.status = SubscriptionStatus.blocked;
            activeSubscription.is_active = false;
            this.subscriptions.set(activeSubscription.id, activeSubscription);
        }
    }

    getSubscriptionById(id: string): SubscriptionEntity | undefined {
        return this.subscriptions.get(id);
    }

    getUserSubscriptions(userId: string): SubscriptionEntity[] {
        return Array.from(this.subscriptions.values()).filter(s => s.user_id === userId);
    }

    getActiveUserSubscription(userId: string): SubscriptionEntity | undefined {
        const now = new Date();
        return Array.from(this.subscriptions.values()).find(
            s => s.user_id === userId && 
                 s.status === SubscriptionStatus.active && 
                 s.expiry_date > now
        );
    }

    getAllSubscriptions(): SubscriptionEntity[] {
        return Array.from(this.subscriptions.values());
    }
}