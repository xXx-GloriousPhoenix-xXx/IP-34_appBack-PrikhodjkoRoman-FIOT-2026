import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config.js';
import { BookingStatus } from '../../utils/bookingStatus.js';
import { UserModel } from './UserModel.js';
import { WorkspaceModel } from './WorkspaceModel.js';

interface BookingAttributes {
    id: string;
    user_id: string;
    workspace_id: string;
    start_time: Date;
    end_time: Date;
    total_hours: number;
    base_amount: number;
    discount_percent: number;
    final_amount: number;
    status: BookingStatus;
    created_at: Date;
}

type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'created_at'>;

export class BookingModel extends Model<BookingAttributes, BookingCreationAttributes>
    implements BookingAttributes {
    declare id: string;
    declare user_id: string;
    declare workspace_id: string;
    declare start_time: Date;
    declare end_time: Date;
    declare total_hours: number;
    declare base_amount: number;
    declare discount_percent: number;
    declare final_amount: number;
    declare status: BookingStatus;
    declare created_at: Date;
}

BookingModel.init(
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
        workspace_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'workspaces', key: 'id' },
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        total_hours: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: false,
            get() {
                const value = this.getDataValue('total_hours');
                return value ? parseFloat(value as unknown as string) : value;
            },
        },
        base_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                const value = this.getDataValue('base_amount');
                return value ? parseFloat(value as unknown as string) : value;
            },
        },
        discount_percent: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        final_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                const value = this.getDataValue('final_amount');
                return value ? parseFloat(value as unknown as string) : value;
            },
        },
        status: {
            type: DataTypes.ENUM(...Object.values(BookingStatus)),
            allowNull: false,
            defaultValue: BookingStatus.unpaid,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'bookings',
        timestamps: false,
    }
);

// Associations
BookingModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
BookingModel.belongsTo(WorkspaceModel, { foreignKey: 'workspace_id', as: 'workspace' });
UserModel.hasMany(BookingModel, { foreignKey: 'user_id', as: 'bookings' });
WorkspaceModel.hasMany(BookingModel, { foreignKey: 'workspace_id', as: 'bookings' });