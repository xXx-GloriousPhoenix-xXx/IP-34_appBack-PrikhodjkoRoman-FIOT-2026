import { Op } from 'sequelize';
import type { SubscriptionEntity } from '../entities/subscriptionEntity.js';
import type { CreateSubscriptionModel } from '../models/createSubscriptionModel.js';
import { SubscriptionModel } from '../database/index.js';
import { UserService } from './userService.js';
import { SubscriptionStatus } from '../utils/subscrriptionStatus.js';

export class SubscriptionService {
    constructor(private userService: UserService) {}

    async createSubscription(data: CreateSubscriptionModel): Promise<SubscriptionEntity> {
        // 1. Перевірка існування користувача
        const user = await this.userService.getUserById(data.user_id);
        if (!user) throw new Error('Користувача не знайдено');

        // 2. БЛ: Перевірка наявності боргів
        if (user.has_debt) {
            throw new Error('Неможливо оформити абонемент: є активні борги');
        }

        // 3. БЛ: Перевірка чи немає вже активного абонемента
        const hasActive = await SubscriptionModel.findOne({
            where: {
                user_id: data.user_id,
                status: SubscriptionStatus.active,
                expiry_date: { [Op.gt]: new Date() },
            },
        });
        if (hasActive) throw new Error('Користувач вже має активний абонемент');

        // 4. Розрахунок терміну
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30 * data.months);

        const subscription = await SubscriptionModel.create({
            user_id: data.user_id,
            expiry_date: expiryDate,
            price: data.price,
            status: SubscriptionStatus.active,
        });

        return subscription.toJSON() as SubscriptionEntity;
    }

    // БЛ: Щоденне оновлення статусів абонементів
    async updateSubscriptionsStatus(): Promise<void> {
        const now = new Date();

        await SubscriptionModel.update(
            { status: SubscriptionStatus.expired, is_active: false },
            {
                where: {
                    status: SubscriptionStatus.active,
                    expiry_date: { [Op.lt]: now },
                },
            }
        );
    }

    // БЛ: Блокування абонементу через борги
    async blockSubscription(userId: string): Promise<void> {
        await SubscriptionModel.update(
            { status: SubscriptionStatus.blocked, is_active: false },
            {
                where: {
                    user_id: userId,
                    status: SubscriptionStatus.active,
                },
            }
        );
    }

    async getSubscriptionById(id: string): Promise<SubscriptionEntity | null> {
        const sub = await SubscriptionModel.findByPk(id);
        return sub ? (sub.toJSON() as SubscriptionEntity) : null;
    }

    async getUserSubscriptions(userId: string): Promise<SubscriptionEntity[]> {
        const subs = await SubscriptionModel.findAll({ where: { user_id: userId } });
        return subs.map(s => s.toJSON() as SubscriptionEntity);
    }

    async getActiveUserSubscription(userId: string): Promise<SubscriptionEntity | null> {
        const sub = await SubscriptionModel.findOne({
            where: {
                user_id: userId,
                status: SubscriptionStatus.active,
                expiry_date: { [Op.gt]: new Date() },
            },
        });
        return sub ? (sub.toJSON() as SubscriptionEntity) : null;
    }

    async getAllSubscriptions(): Promise<SubscriptionEntity[]> {
        const subs = await SubscriptionModel.findAll();
        return subs.map(s => s.toJSON() as SubscriptionEntity);
    }
}