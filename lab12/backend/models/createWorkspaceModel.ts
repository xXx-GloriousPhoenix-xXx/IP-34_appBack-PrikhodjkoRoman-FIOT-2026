import { WorkspaceType } from "../utils/workspaceType.js";

export type CreateWorkspaceModel = {
    name: string;
    type: WorkspaceType;
    capacity: number;
    price_per_hour: number;
};