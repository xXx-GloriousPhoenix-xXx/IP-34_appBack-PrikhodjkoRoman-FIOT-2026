import type { WorkspaceType } from "../utils/workspaceType.js";

export type WorkspaceEntity = {
    id: string;
    name: string;
    type: WorkspaceType;
    capacity: number;
    price_per_hour: number;
    is_active: boolean;
};