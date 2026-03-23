import type { UserEntity } from '../entities/userEntity.js';
import type { CreateUserModel } from '../models/createUserModel.js';
import { UserModel } from '../database/index.js';

export class UserService {

    async createUser(data: CreateUserModel): Promise<UserEntity> {
        // Перевірка віку (бізнес-логіка: мінімальний вік для реєстрації - 16 років)
        if (data.age < 16) {
            throw new Error('Користувач повинен бути старше 16 років');
        }

        // Перевірка email на унікальність
        const existingUser = await UserModel.findOne({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('Користувач з таким email вже існує');
        }

        const user = await UserModel.create({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            age: data.age,
        });

        return user.toJSON() as UserEntity;
    }

    async getUserById(id: string): Promise<UserEntity | null> {
        const user = await UserModel.findByPk(id);
        return user ? (user.toJSON() as UserEntity) : null;
    }

    async getAllUsers(): Promise<UserEntity[]> {
        const users = await UserModel.findAll();
        return users.map(u => u.toJSON() as UserEntity);
    }

    async updateUserDebt(id: string, hasDebt: boolean): Promise<UserEntity | null> {
        const user = await UserModel.findByPk(id);
        if (!user) return null;

        user.has_debt = hasDebt;
        await user.save();
        return user.toJSON() as UserEntity;
    }
}