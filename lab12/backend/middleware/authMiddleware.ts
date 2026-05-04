import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { UserService } from '../services/userService.js';

// Extend Express Request with auth fields
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: string;
        }
    }
}

// Singleton to avoid re-instantiation inside middleware factory
const _userService = new UserService();
const _authService = new AuthService(_userService);

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Токен авторизації відсутній' });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const payload = _authService.verifyToken(token);
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    } catch {
        res.status(401).json({ success: false, error: 'Недійсний або прострочений токен' });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (req.userRole !== 'admin') {
        res.status(403).json({ success: false, error: 'Доступ заборонено. Потрібні права адміністратора' });
        return;
    }
    next();
}