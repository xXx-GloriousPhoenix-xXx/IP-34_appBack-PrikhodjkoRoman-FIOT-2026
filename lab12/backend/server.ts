import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// Імпорт Swagger конфігурації
import swaggerSpec from './swagger/swagger.config.js';

// Імпорт бази даних
import { initDatabase } from './database/index.js';

// Імпорт сервісів
import { UserService } from './services/userService.js';
import { WorkspaceService } from './services/workspaceService.js';
import { BookingService } from './services/bookingService.js';
import { SubscriptionService } from './services/subscriptionService.js';

// Імпорт контролерів
import { UserController } from './controllers/userController.js';
import { WorkspaceController } from './controllers/workspaceController.js';
import { BookingController } from './controllers/bookingController.js';
import { SubscriptionController } from './controllers/subscriptionController.js';

// Імпорт роутів
import { createUserRouter } from './routes/userRoutes.js';
import { createWorkspaceRouter } from './routes/workspaceRoutes.js';
import { createBookingRouter } from './routes/bookingRoutes.js';
import { createSubscriptionRouter } from './routes/subscriptionRoutes.js';

export class Server {
    private app: Express;
    private port: number;

    // Сервіси
    private userService: UserService;
    private workspaceService: WorkspaceService;
    private bookingService: BookingService;
    private subscriptionService: SubscriptionService;

    // Контролери
    private userController: UserController;
    private workspaceController: WorkspaceController;
    private bookingController: BookingController;
    private subscriptionController: SubscriptionController;

    constructor(port: number = 10000) {
        this.port = port;
        this.app = express();

        // Ініціалізація сервісів
        this.userService = new UserService();
        this.workspaceService = new WorkspaceService();
        this.bookingService = new BookingService(this.userService, this.workspaceService);
        this.subscriptionService = new SubscriptionService(this.userService);

        // Ініціалізація контролерів
        this.userController = new UserController(this.userService);
        this.workspaceController = new WorkspaceController(this.workspaceService);
        this.bookingController = new BookingController(this.bookingService);
        this.subscriptionController = new SubscriptionController(this.subscriptionService);

        this.setupMiddleware();
        this.setupSwagger();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use(express.json());

        // Логування всіх запитів
        this.app.use((req, _res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }

    private setupSwagger(): void {
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Коворкінг API Документація',
            customfavIcon: '/favicon.ico'
        }));

        this.app.get('/api-docs.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }

    private setupRoutes(): void {
        this.app.get('/', (_req, res) => {
            res.json({
                success: true,
                message: 'Коворкінг API працює',
                version: '1.0.0',
                endpoints: {
                    users: '/api/users',
                    workspaces: '/api/workspaces',
                    bookings: '/api/bookings',
                    subscriptions: '/api/subscriptions'
                }
            });
        });

        this.app.use('/api/users', createUserRouter(this.userController));
        this.app.use('/api/workspaces', createWorkspaceRouter(this.workspaceController));
        this.app.use('/api/bookings', createBookingRouter(this.bookingController));
        this.app.use('/api/subscriptions', createSubscriptionRouter(this.subscriptionController));

        // Обробка 404
        this.app.use((_req, res) => {
            res.status(404).json({
                success: false,
                error: 'Шлях не знайдено'
            });
        });
    }

    // Фонові задачі — запускаються тільки після старту сервера
    private setupBackgroundJobs(): void {
        // Запускаємо перевірки кожну годину
        setInterval(async () => {
            console.log(`[${new Date().toISOString()}] Запуск фонових перевірок...`);
            await this.bookingService.cancelOverdueBookings();
            await this.bookingService.completeExpiredBookings();
            await this.subscriptionService.updateSubscriptionsStatus();
            console.log(`[${new Date().toISOString()}] Фонові перевірки завершено`);
        }, 60 * 60 * 1000);

        // Синхронізація при старті — невелика затримка щоб сервер встиг піднятись
        setTimeout(async () => {
            await this.bookingService.cancelOverdueBookings();
            await this.bookingService.completeExpiredBookings();
            await this.subscriptionService.updateSubscriptionsStatus();
        }, 5000);
    }

    // start() тепер async — спочатку БД, потім listen
    public async start(): Promise<void> {
        await initDatabase();

        this.app.listen(this.port, () => {
            console.log(`\nСервер запущено на порту ${this.port}`);
            console.log(`http://localhost:${this.port}`);
            console.log(`\nДоступні ендпоінти:`);
            console.log(`   GET  / - перевірка API`);
            console.log(`   POST /api/users - створити користувача`);
            console.log(`   GET  /api/users - всі користувачі`);
            console.log(`   POST /api/workspaces - створити робоче місце`);
            console.log(`   GET  /api/workspaces - всі робочі місця`);
            console.log(`   POST /api/bookings - створити бронювання`);
            console.log(`   POST /api/bookings/:id/cancel - скасувати бронювання`);
            console.log(`   POST /api/bookings/:id/pay - оплатити бронювання`);
            console.log(`   POST /api/subscriptions - оформити абонемент`);
        });

        // Фонові задачі стартують після того як сервер підняв порт
        this.setupBackgroundJobs();
    }

    public stop(): void {
        console.log('Зупинка сервера...');
        process.exit(0);
    }
}