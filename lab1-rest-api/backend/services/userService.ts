import type { UserEntity } from "../entities/userEntity.ts";
import type { CreateUserModel } from "../models/createUserModel.ts";
import { v4 as uuidv4 } from 'uuid';

export class UserService {
    private users: Map<string, UserEntity> = new Map();

    createUser(data: CreateUserModel): UserEntity {
        // Перевірка віку (бізнес-логіка: мінімальний вік для реєстрації - 16 років)
        if (data.age < 16) {
            throw new Error("Користувач повинен бути старше 16 років");
        }

        // Перевірка email на унікальність
        const existingUser = Array.from(this.users.values()).find(u => u.email === data.email);
        if (existingUser) {
            throw new Error("Користувач з таким email вже існує");
        }

        const user: UserEntity = {
            id: uuidv4(),
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            age: data.age,
            registration_date: new Date(),
            has_debt: false
        };

        this.users.set(user.id, user);
        return user;
    }

    getUserById(id: string): UserEntity | undefined {
        return this.users.get(id);
    }

    getAllUsers(): UserEntity[] {
        return Array.from(this.users.values());
    }

    updateUserDebt(id: string, hasDebt: boolean): UserEntity | undefined {
        const user = this.users.get(id);
        if (user) {
            user.has_debt = hasDebt;
            this.users.set(id, user);
        }
        return user;
    }
}