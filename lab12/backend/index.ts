import { Server } from './server.js';

process.on('SIGINT', () => {
    console.log('\nОтримано сигнал SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nОтримано сигнал SIGTERM');
    process.exit(0);
});

const server = new Server(10000);
server.start();