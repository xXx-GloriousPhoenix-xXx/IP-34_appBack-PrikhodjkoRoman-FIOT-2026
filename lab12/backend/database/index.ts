import { sequelize } from './config.js';

import './models/UserModel.js';
import './models/WorkspaceModel.js';
import './models/BookingModel.js';      
import './models/SubscriptionModel.js';
import './models/AuthModel.js';

export { sequelize };
export { UserModel } from './models/UserModel.js';
export { WorkspaceModel } from './models/WorkspaceModel.js';
export { BookingModel } from './models/BookingModel.js';
export { SubscriptionModel } from './models/SubscriptionModel.js';
export { AuthModel } from './models/AuthModel.js';

export async function initDatabase(): Promise<void> {
    await sequelize.authenticate();

    const alter = process.env['NODE_ENV'] !== 'production';
    await sequelize.sync({ alter });
}