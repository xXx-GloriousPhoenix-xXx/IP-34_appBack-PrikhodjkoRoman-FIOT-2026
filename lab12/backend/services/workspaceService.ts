import type { WorkspaceEntity } from '../entities/workspaceEntity.js';
import type { CreateWorkspaceModel } from '../models/createWorkspaceModel.js';
import { WorkspaceModel } from '../database/index.js';

export class WorkspaceService {

    async createWorkspace(data: CreateWorkspaceModel): Promise<WorkspaceEntity> {
        if (data.price_per_hour <= 0) {
            throw new Error('Ціна повинна бути більше 0');
        }
        if (data.capacity <= 0) {
            throw new Error('Місткість повинна бути більше 0');
        }

        const workspace = await WorkspaceModel.create({
            name: data.name,
            type: data.type,
            capacity: data.capacity,
            price_per_hour: data.price_per_hour,
        });

        return workspace.toJSON() as WorkspaceEntity;
    }

    async getWorkspaceById(id: string): Promise<WorkspaceEntity | null> {
        const workspace = await WorkspaceModel.findByPk(id);
        return workspace ? (workspace.toJSON() as WorkspaceEntity) : null;
    }

    async getAllWorkspaces(): Promise<WorkspaceEntity[]> {
        const workspaces = await WorkspaceModel.findAll();
        return workspaces.map(w => w.toJSON() as WorkspaceEntity);
    }

    async getActiveWorkspaces(): Promise<WorkspaceEntity[]> {
        const workspaces = await WorkspaceModel.findAll({ where: { is_active: true } });
        return workspaces.map(w => w.toJSON() as WorkspaceEntity);
    }

    async updateWorkspaceStatus(id: string, isActive: boolean): Promise<WorkspaceEntity | null> {
        const workspace = await WorkspaceModel.findByPk(id);
        if (!workspace) return null;

        workspace.is_active = isActive;
        await workspace.save();
        return workspace.toJSON() as WorkspaceEntity;
    }
}