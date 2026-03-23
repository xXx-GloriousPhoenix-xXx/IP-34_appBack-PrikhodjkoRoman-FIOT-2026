import type { Request, Response } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
    constructor(private userService: UserService) {}

    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({ success: true, data: user });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id || Array.isArray(id)) {
                res.status(400).json({ success: false, error: 'ID користувача має бути рядком' });
                return;
            }

            const user = await this.userService.getUserById(id);

            if (!user) {
                res.status(404).json({ success: false, error: 'Користувача не знайдено' });
                return;
            }

            res.json({ success: true, data: user });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getAllUsers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();
            res.json({ success: true, data: users });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}