import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config.js';
import { SubscriptionStatus } from '../../utils/subscrriptionStatus.js';
import { UserModel } from './UserModel.js';

interface SubscriptionAttributes {
    id: string;
    user_id: string;
    purchase_date: Date;
    activation_date: Date;
    expiry_date: Date;
    price: number;
    is_active: boolean;
    status: SubscriptionStatus;
}

type SubscriptionCreationAttributes = Optional<
    SubscriptionAttributes,
    'id' | 'purchase_date' | 'activation_date' | 'is_active'
>;

export class SubscriptionModel
    extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
    implements SubscriptionAttributes {
    declare id: string;
    declare user_id: string;
    declare purchase_date: Date;
    declare activation_date: Date;
    declare expiry_date: Date;
    declare price: number;
    declare is_active: boolean;
    declare status: SubscriptionStatus;
}

SubscriptionModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        purchase_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        activation_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                const value = this.getDataValue('price');
                return value ? parseFloat(value as unknown as string) : value;
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'subscriptions',
        timestamps: false,
    }
);

// Associations
SubscriptionModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
UserModel.hasMany(SubscriptionModel, { foreignKey: 'user_id', as: 'subscriptions' });