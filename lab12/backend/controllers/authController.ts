import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export class AuthController {
    constructor(private authService: AuthService) {}

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { full_name, email, phone, age, password } = req.body;

            if (!full_name || !email || !phone || !age || !password) {
                res.status(400).json({
                    success: false,
                    error: "Необхідно вказати full_name, email, phone, age та password",
                });
                return;
            }

            if (typeof password !== 'string' || password.length < 6) {
                res.status(400).json({
                    success: false,
                    error: "Пароль має містити щонайменше 6 символів",
                });
                return;
            }

            const result = await this.authService.register({
                full_name,
                email,
                phone,
                age: Number(age),
                password,
            });

            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: "Необхідно вказати email та password",
                });
                return;
            }

            const result = await this.authService.login({ email, password });
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(401).json({ success: false, error: error.message });
        }
    };

    me = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Не авторизовано' });
                return;
            }
            // Return current user info from token
            res.json({ success: true, data: { userId, role: (req as any).userRole } });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}