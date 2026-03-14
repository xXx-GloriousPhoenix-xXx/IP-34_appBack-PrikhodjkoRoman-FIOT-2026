import type { WorkspaceEntity } from "../entities/workspaceEntity.ts";
import type { CreateWorkspaceModel } from "../models/createWorkspaceModel.ts";
import { v4 as uuidv4 } from 'uuid';

export class WorkspaceService {
    private workspaces: Map<string, WorkspaceEntity> = new Map();

    createWorkspace(data: CreateWorkspaceModel): WorkspaceEntity {
        // Валідація ціни
        if (data.price_per_hour <= 0) {
            throw new Error("Ціна повинна бути більше 0");
        }

        // Валідація місткості
        if (data.capacity <= 0) {
            throw new Error("Місткість повинна бути більше 0");
        }

        const workspace: WorkspaceEntity = {
            id: uuidv4(),
            name: data.name,
            type: data.type,
            capacity: data.capacity,
            price_per_hour: data.price_per_hour,
            is_active: true
        };

        this.workspaces.set(workspace.id, workspace);
        return workspace;
    }

    getWorkspaceById(id: string): WorkspaceEntity | undefined {
        return this.workspaces.get(id);
    }

    getAllWorkspaces(): WorkspaceEntity[] {
        return Array.from(this.workspaces.values());
    }

    getActiveWorkspaces(): WorkspaceEntity[] {
        return Array.from(this.workspaces.values()).filter(w => w.is_active);
    }

    updateWorkspaceStatus(id: string, isActive: boolean): WorkspaceEntity | undefined {
        const workspace = this.workspaces.get(id);
        if (workspace) {
            workspace.is_active = isActive;
            this.workspaces.set(id, workspace);
        }
        return workspace;
    }
}