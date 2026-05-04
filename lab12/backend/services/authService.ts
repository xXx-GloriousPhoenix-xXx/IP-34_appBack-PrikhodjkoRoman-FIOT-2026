import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthModel } from '../database/index.js';
import { UserModel } from '../database/index.js';
import { UserService } from './userService.js';
import type { RegisterModel } from '../models/registerModel.js';
import type { LoginModel } from '../models/loginModel.js';
import type { AuthTokenPayload } from '../entities/authEntity.js';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'coworking_secret_key_change_in_prod';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 10;

export class AuthService {
    constructor(private userService: UserService) {}

    async register(data: RegisterModel): Promise<{ token: string; user: object }> {
        // Check email uniqueness via existing users
        const existing = await UserModel.findOne({ where: { email: data.email } });
        if (existing) {
            throw new Error('Користувач з таким email вже існує');
        }

        // Create user record (reuse UserService logic)
        const user = await this.userService.createUser({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            age: data.age,
        });

        // Hash password and create auth record
        const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
        await AuthModel.create({
            user_id: user.id,
            password_hash,
            role: 'user',
        });

        const token = this.generateToken(user.id, 'user');
        return { token, user: this.sanitizeUser(user) };
    }

    async login(data: LoginModel): Promise<{ token: string; user: object }> {
        // Find user by email
        const userRecord = await UserModel.findOne({ where: { email: data.email } });
        if (!userRecord) {
            throw new Error('Невірний email або пароль');
        }

        // Find auth record
        const authRecord = await AuthModel.findOne({ where: { user_id: userRecord.id } });
        if (!authRecord) {
            throw new Error('Невірний email або пароль');
        }

        // Verify password
        const isValid = await bcrypt.compare(data.password, authRecord.password_hash);
        if (!isValid) {
            throw new Error('Невірний email або пароль');
        }

        const token = this.generateToken(userRecord.id, authRecord.role);
        return { token, user: this.sanitizeUser(userRecord.toJSON()) };
    }

    verifyToken(token: string): AuthTokenPayload {
        return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    }

    private generateToken(userId: string, role: string): string {
        return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    private sanitizeUser(user: any): object {
        const { ...safe } = user;
        return {
            id: safe.id,
            full_name: safe.full_name,
            email: safe.email,
            phone: safe.phone,
            age: safe.age,
            has_debt: safe.has_debt,
            registration_date: safe.registration_date,
        };
    }
}