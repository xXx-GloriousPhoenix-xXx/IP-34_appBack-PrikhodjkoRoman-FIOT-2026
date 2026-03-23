import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspaceController.js';

export const createWorkspaceRouter = (workspaceController: WorkspaceController) => {
    const router = Router();

    /**
     * @swagger
     * /api/workspaces:
     *   post:
     *     summary: Створити нове робоче місце
     *     description: Додає нове робоче місце або переговорну кімнату
     *     tags: [Workspaces]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - type
     *               - capacity
     *               - price_per_hour
     *             properties:
     *               name:
     *                 type: string
     *                 description: Назва робочого місця
     *                 example: "Стіл біля вікна"
     *               type:
     *                 type: string
     *                 enum: [desk, meeting_room]
     *                 description: Тип місця (desk - робочий стіл, meeting_room - переговорна)
     *                 example: "desk"
     *               capacity:
     *                 type: integer
     *                 minimum: 1
     *                 description: Місткість (кількість людей)
     *                 example: 2
     *               price_per_hour:
     *                 type: number
     *                 minimum: 0
     *                 description: Ціна за годину в гривнях
     *                 example: 150
     *     responses:
     *       201:
     *         description: Робоче місце успішно створено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Workspace'
     *       400:
     *         description: Помилка валідації
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/', workspaceController.createWorkspace);

    /**
     * @swagger
     * /api/workspaces:
     *   get:
     *     summary: Отримати всі робочі місця
     *     description: Повертає список всіх активних робочих місць
     *     tags: [Workspaces]
     *     responses:
     *       200:
     *         description: Список робочих місць
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Workspace'
     */
    router.get('/', workspaceController.getAllWorkspaces);

    /**
     * @swagger
     * /api/workspaces/{id}:
     *   get:
     *     summary: Отримати робоче місце за ID
     *     description: Повертає детальну інформацію про конкретне робоче місце
     *     tags: [Workspaces]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Унікальний ідентифікатор робочого місця
     *         example: "123e4567-e89b-12d3-a456-426614174000"
     *     responses:
     *       200:
     *         description: Робоче місце знайдено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Workspace'
     *       404:
     *         description: Робоче місце не знайдено
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get('/:id', workspaceController.getWorkspaceById);

    /**
     * @swagger
     * /api/workspaces/{id}/status:
     *   patch:
     *     summary: Оновити статус робочого місця
     *     description: Активувати або деактивувати робоче місце
     *     tags: [Workspaces]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Унікальний ідентифікатор робочого місця
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - is_active
     *             properties:
     *               is_active:
     *                 type: boolean
     *                 description: Новий статус (true - активно, false - неактивно)
     *                 example: false
     *     responses:
     *       200:
     *         description: Статус оновлено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Workspace'
     *       400:
     *         description: Помилка валідації
     *       404:
     *         description: Робоче місце не знайдено
     */
    router.patch('/:id/status', workspaceController.updateWorkspaceStatus);

    return router;
};