import type { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscriptionService.js';

export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {}

    createSubscription = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id, price, months } = req.body;

            if (!user_id || !price) {
                res.status(400).json({ success: false, error: 'Необхідно вказати user_id та price' });
                return;
            }

            if (typeof user_id !== 'string') {
                res.status(400).json({ success: false, error: 'user_id має бути рядком' });
                return;
            }

            if (typeof price !== 'number' || price <= 0) {
                res.status(400).json({ success: false, error: 'price має бути додатнім числом' });
                return;
            }

            if (typeof months !== 'number' || months <= 1) {
                res.status(400).json({ success: false, error: 'months має бути числом більшим за 1' });
                return;
            }

            const subscription = await this.subscriptionService.createSubscription({ user_id, price, months });
            res.status(201).json({ success: true, data: subscription });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({ success: false, error: 'ID абонемента має бути рядком' });
                return;
            }

            const subscription = await this.subscriptionService.getSubscriptionById(id);

            if (!subscription) {
                res.status(404).json({ success: false, error: 'Абонемент не знайдено' });
                return;
            }

            res.json({ success: true, data: subscription });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;

            if (typeof userId !== 'string' || !userId) {
                res.status(400).json({ success: false, error: 'ID користувача має бути рядком' });
                return;
            }

            const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);
            res.json({ success: true, data: subscriptions });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getActiveUserSubscription = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;

            if (typeof userId !== 'string' || !userId) {
                res.status(400).json({ success: false, error: 'ID користувача має бути рядком' });
                return;
            }

            const subscription = await this.subscriptionService.getActiveUserSubscription(userId);
            res.json({ success: true, data: subscription || null });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getAllSubscriptions = async (_req: Request, res: Response): Promise<void> => {
        try {
            const subscriptions = await this.subscriptionService.getAllSubscriptions();
            res.json({ success: true, data: subscriptions });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}