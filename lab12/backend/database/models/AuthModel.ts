import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config.js';
import { UserModel } from './UserModel.js';

export type AuthRole = 'admin' | 'user';

interface AuthAttributes {
    id: string;
    user_id: string;
    password_hash: string;
    role: AuthRole;
    created_at: Date;
}

type AuthCreationAttributes = Optional<AuthAttributes, 'id' | 'created_at' | 'role'>;

export class AuthModel extends Model<AuthAttributes, AuthCreationAttributes>
    implements AuthAttributes {
    declare id: string;
    declare user_id: string;
    declare password_hash: string;
    declare role: AuthRole;
    declare created_at: Date;
}

AuthModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: { model: 'users', key: 'id' },
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'auth',
        timestamps: false,
    }
);

// Associations
AuthModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
UserModel.hasOne(AuthModel, { foreignKey: 'user_id', as: 'auth' });