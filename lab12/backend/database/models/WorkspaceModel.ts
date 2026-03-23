import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config.js';
import type { WorkspaceType } from '../../utils/workspaceType.js';

interface WorkspaceAttributes {
    id: string;
    name: string;
    type: WorkspaceType;
    capacity: number;
    price_per_hour: number;
    is_active: boolean;
}

type WorkspaceCreationAttributes = Optional<WorkspaceAttributes, 'id' | 'is_active'>;

export class WorkspaceModel extends Model<WorkspaceAttributes, WorkspaceCreationAttributes>
    implements WorkspaceAttributes {
    declare id: string;
    declare name: string;
    declare type: WorkspaceType;
    declare capacity: number;
    declare price_per_hour: number;
    declare is_active: boolean;
}

WorkspaceModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price_per_hour: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                const value = this.getDataValue('price_per_hour');
                return value ? parseFloat(value as unknown as string) : value;
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'workspaces',
        timestamps: false,
    }
);