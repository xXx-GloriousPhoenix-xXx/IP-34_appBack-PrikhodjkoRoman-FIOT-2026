import { sequelize } from './config.js';

// Import all models to register them with Sequelize
import './models/UserModel.js';
import './models/WorkspaceModel.js';
import './models/BookingModel.js';      // also registers associations
import './models/SubscriptionModel.js'; // also registers associations

export { sequelize };
export { UserModel } from './models/UserModel.js';
export { WorkspaceModel } from './models/WorkspaceModel.js';
export { BookingModel } from './models/BookingModel.js';
export { SubscriptionModel } from './models/SubscriptionModel.js';

export async function initDatabase(): Promise<void> {
    await sequelize.authenticate();

    const alter = process.env['NODE_ENV'] !== 'production';
    await sequelize.sync({ alter });
}