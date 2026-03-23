import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config.js';

interface UserAttributes {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    age: number;
    registration_date: Date;
    has_debt: boolean;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'registration_date' | 'has_debt'>;

export class UserModel extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    declare id: string;
    declare full_name: string;
    declare email: string;
    declare phone: string;
    declare age: number;
    declare registration_date: Date;
    declare has_debt: boolean;
}

UserModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        registration_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        has_debt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: false,
    }
);