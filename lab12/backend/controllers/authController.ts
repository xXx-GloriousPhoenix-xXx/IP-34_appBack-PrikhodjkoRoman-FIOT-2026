import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+380\d{9}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
};

export class AuthController {
    constructor(private authService: AuthService) {}

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { full_name, email, phone, age, password } = req.body;

            // 1. Проверка наличия полей
            if (!full_name || !email || !phone || !age || !password) {
                res.status(400).json({
                    success: false,
                    error: "Усі поля обов'язкові для заповнення (full_name, email, phone, age, password)",
                });
                return;
            }

            // 2. Валидация Email
            if (!PATTERNS.email.test(email)) {
                res.status(400).json({ success: false, error: "Некоректний формат email" });
                return;
            }

            // 3. Валидация Телефона
            if (!PATTERNS.phone.test(phone)) {
                res.status(400).json({ success: false, error: "Некоректний формат телефону (+380XXXXXXXXX)" });
                return;
            }

            // 4. Валидация Пароля (Сложная проверка)
            if (!PATTERNS.password.test(password)) {
                res.status(400).json({
                    success: false,
                    error: "Пароль надто слабкий. Має бути мін. 8 символів, заглавна та мала літери, цифра та спецсимвол.",
                });
                return;
            }

            // 5. Валидация возраста
            const numericAge = Number(age);
            if (isNaN(numericAge) || numericAge < 1 || numericAge > 120) {
                res.status(400).json({ success: false, error: "Будь ласка, вкажіть коректний вік" });
                return;
            }

            const result = await this.authService.register({
                full_name,
                email,
                phone,
                age: numericAge,
                password,
            });

            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            // Если в сервисе есть проверка на существующий email — она упадет сюда
            res.status(400).json({ success: false, error: error.message });
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ success: false, error: "Вкажіть email та пароль" });
                return;
            }

            const result = await this.authService.login({ email, password });
            res.json({ success: true, data: result });
        } catch (error: any) {
            // Ошибка "Невірний email або пароль"
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