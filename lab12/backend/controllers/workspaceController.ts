import type { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspaceService.js';

export class WorkspaceController {
    constructor(private workspaceService: WorkspaceService) {}

    createWorkspace = async (req: Request, res: Response): Promise<void> => {
        try {
            const workspace = await this.workspaceService.createWorkspace(req.body);
            res.status(201).json({ success: true, data: workspace });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getWorkspaceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({ success: false, error: 'ID робочого місця має бути рядком' });
                return;
            }

            const workspace = await this.workspaceService.getWorkspaceById(id);

            if (!workspace) {
                res.status(404).json({ success: false, error: 'Робоче місце не знайдено' });
                return;
            }

            res.json({ success: true, data: workspace });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    getAllWorkspaces = async (req: Request, res: Response): Promise<void> => {
        try {
            const { active } = req.query;

            const workspaces = active === 'true'
                ? await this.workspaceService.getActiveWorkspaces()
                : await this.workspaceService.getAllWorkspaces();

            res.json({ success: true, data: workspaces });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    updateWorkspaceStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            if (typeof id !== 'string' || !id) {
                res.status(400).json({ success: false, error: 'ID робочого місця має бути рядком' });
                return;
            }

            if (typeof is_active !== 'boolean') {
                res.status(400).json({ success: false, error: 'Поле is_active має бути boolean' });
                return;
            }

            const workspace = await this.workspaceService.updateWorkspaceStatus(id, is_active);

            if (!workspace) {
                res.status(404).json({ success: false, error: 'Робоче місце не знайдено' });
                return;
            }

            res.json({ success: true, data: workspace });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}