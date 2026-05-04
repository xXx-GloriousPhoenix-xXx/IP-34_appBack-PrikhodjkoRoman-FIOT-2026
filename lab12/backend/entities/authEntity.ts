import type { AuthRole } from '../database/models/AuthModel.js';

export type AuthEntity = {
    id: string;
    user_id: string;
    password_hash: string;
    role: AuthRole;
    created_at: Date;
};

export type AuthTokenPayload = {
    userId: string;
    role: AuthRole;
};