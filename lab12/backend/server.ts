import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from './swagger/swagger.config.js';
import { initDatabase } from './database/index.js';

import { UserService } from './services/userService.js';
import { WorkspaceService } from './services/workspaceService.js';
import { BookingService } from './services/bookingService.js';
import { SubscriptionService } from './services/subscriptionService.js';
import { AuthService } from './services/authService.js';

import { UserController } from './controllers/userController.js';
import { WorkspaceController } from './controllers/workspaceController.js';
import { BookingController } from './controllers/bookingController.js';
import { SubscriptionController } from './controllers/subscriptionController.js';
import { AuthController } from './controllers/authController.js';

import { createUserRouter } from './routes/userRoutes.js';
import { createWorkspaceRouter } from './routes/workspaceRoutes.js';
import { createBookingRouter } from './routes/bookingRoutes.js';
import { createSubscriptionRouter } from './routes/subscriptionRoutes.js';
import { createAuthRouter } from './routes/authRoutes.js';

import { authMiddleware } from './middleware/authMiddleware.js';

export class Server {
    private app: Express;
    private port: number;

    private userService: UserService;
    private workspaceService: WorkspaceService;
    private bookingService: BookingService;
    private subscriptionService: SubscriptionService;
    private authService: AuthService;

    private userController: UserController;
    private workspaceController: WorkspaceController;
    private bookingController: BookingController;
    private subscriptionController: SubscriptionController;
    private authController: AuthController;

    constructor(port: number = 10000) {
        this.port = port;
        this.app = express();

        this.userService = new UserService();
        this.workspaceService = new WorkspaceService();
        this.bookingService = new BookingService(this.userService, this.workspaceService);
        this.subscriptionService = new SubscriptionService(this.userService);
        this.authService = new AuthService(this.userService);

        this.userController = new UserController(this.userService);
        this.workspaceController = new WorkspaceController(this.workspaceService);
        this.bookingController = new BookingController(this.bookingService);
        this.subscriptionController = new SubscriptionController(this.subscriptionService);
        this.authController = new AuthController(this.authService);

        this.setupMiddleware();
        this.setupSwagger();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use(express.json());

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
            });
        });

        // ── Public routes ──────────────────────────────────────────────
        this.app.use('/api/auth', createAuthRouter(this.authController));

        // ── Protected routes (JWT required) ────────────────────────────
        this.app.use('/api/users', authMiddleware, createUserRouter(this.userController));
        this.app.use('/api/workspaces', authMiddleware, createWorkspaceRouter(this.workspaceController));
        this.app.use('/api/bookings', authMiddleware, createBookingRouter(this.bookingController));
        this.app.use('/api/subscriptions', authMiddleware, createSubscriptionRouter(this.subscriptionController));

        // 404
        this.app.use((_req, res) => {
            res.status(404).json({ success: false, error: 'Шлях не знайдено' });
        });
    }

    private setupBackgroundJobs(): void {
        setInterval(async () => {
            console.log(`[${new Date().toISOString()}] Запуск фонових перевірок...`);
            await this.bookingService.cancelOverdueBookings();
            await this.bookingService.completeExpiredBookings();
            await this.subscriptionService.updateSubscriptionsStatus();
        }, 60 * 60 * 1000);

        setTimeout(async () => {
            await this.bookingService.cancelOverdueBookings();
            await this.bookingService.completeExpiredBookings();
            await this.subscriptionService.updateSubscriptionsStatus();
        }, 5000);
    }

    public async start(): Promise<void> {
        await initDatabase();

        this.app.listen(this.port, () => {
            console.log(`\nСервер запущено на порту ${this.port}`);
            console.log(`http://localhost:${this.port}`);
            console.log('\nПублічні ендпоінти:');
            console.log('   POST /api/auth/register');
            console.log('   POST /api/auth/login');
            console.log('\nЗахищені ендпоінти (потрібен Bearer токен):');
            console.log('   /api/users  /api/workspaces  /api/bookings  /api/subscriptions');
        });

        this.setupBackgroundJobs();
    }

    public stop(): void {
        console.log('Зупинка сервера...');
        process.exit(0);
    }
}