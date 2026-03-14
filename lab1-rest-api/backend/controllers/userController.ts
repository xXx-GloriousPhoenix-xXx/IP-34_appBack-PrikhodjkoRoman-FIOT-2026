import type { Request, Response } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
    constructor(private userService: UserService) {}

    createUser = (req: Request, res: Response): void => {
        try {
            const user = this.userService.createUser(req.body);
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    getUserById = (req: Request, res: Response): void => {
        try {
            const { id } = req.params;
            
            // Перевірка, що id є рядком, а не масивом
            if (!id || Array.isArray(id)) {
                res.status(400).json({
                    success: false,
                    error: 'ID користувача має бути рядком'
                });
                return;
            }

            const user = this.userService.getUserById(id);
            
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'Користувача не знайдено'
                });
                return;
            }
            
            res.json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    getAllUsers = (_req: Request, res: Response): void => {
        try {
            const users = this.userService.getAllUsers();
            res.json({
                success: true,
                data: users
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };
}