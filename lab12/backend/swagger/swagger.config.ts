import swaggerJsdoc from "swagger-jsdoc";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Коворкінг API',
            version: '1.0.0',
            description: 'REST API для системи бронювання робочих місць у коворкінгу',
            contact: {
                name: 'Роман Приходько',
                email: 'roman@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:10000',
                description: 'Локальний сервер'
            },
            {
                url: 'https://api.coworking.com',
                description: 'Продакшн сервер'
            }
        ],
        tags: [
            {
                name: 'Users',
                description: 'Операції з користувачами'
            },
            {
                name: 'Workspaces',
                description: 'Операції з робочими місцями'
            },
            {
                name: 'Bookings',
                description: 'Операції з бронюваннями'
            },
            {
                name: 'Subscriptions',
                description: 'Операції з абонементами'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                        full_name: { type: 'string', example: 'Іван Петренко' },
                        email: { type: 'string', format: 'email', example: 'ivan@mail.com' },
                        phone: { type: 'string', example: '+380991234567' },
                        age: { type: 'integer', minimum: 16, example: 25 },
                        registration_date: { type: 'string', format: 'date-time' },
                        has_debt: { type: 'boolean', example: false }
                    }
                },
                Workspace: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Стіл біля вікна' },
                        type: { type: 'string', enum: ['desk', 'meeting_room'], example: 'desk' },
                        capacity: { type: 'integer', minimum: 1, example: 2 },
                        price_per_hour: { type: 'number', minimum: 0, example: 150 },
                        is_active: { type: 'boolean', example: true }
                    }
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        user_id: { type: 'string', format: 'uuid' },
                        workspace_id: { type: 'string', format: 'uuid' },
                        start_time: { type: 'string', format: 'date-time' },
                        end_time: { type: 'string', format: 'date-time' },
                        total_hours: { type: 'number', example: 5 },
                        base_amount: { type: 'number', example: 750 },
                        discount_percent: { type: 'integer', minimum: 0, maximum: 100, example: 10 },
                        final_amount: { type: 'number', example: 675 },
                        status: { type: 'string', enum: ['active', 'cancelled', 'completed', 'unpaid'], example: 'unpaid' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Subscription: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        user_id: { type: 'string', format: 'uuid' },
                        purchase_date: { type: 'string', format: 'date-time' },
                        activation_date: { type: 'string', format: 'date-time' },
                        expiry_date: { type: 'string', format: 'date-time' },
                        price: { type: 'number', example: 3000 },
                        is_active: { type: 'boolean', example: true },
                        status: { type: 'string', enum: ['active', 'expired', 'blocked'], example: 'active' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Повідомлення про помилку' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../controllers/*.ts')
    ],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;