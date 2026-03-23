// Базовий клас для API запитів
class ApiClient {
    constructor(baseURL = 'http://localhost:10000/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Помилка запиту');
            }

            return data;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    }

    // GET запит
    get(endpoint) {
        return this.request(endpoint);
    }

    // POST запит
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    // PATCH запит
    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    // DELETE запит
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// API для користувачів
class UsersAPI extends ApiClient {
    constructor() {
        super();
    }

    async getAll() {
        const response = await this.get('/users');
        return response.data;
    }

    async getById(id) {
        const response = await this.get(`/users/${id}`);
        return response.data;
    }

    async create(userData) {
        const response = await this.post('/users', userData);
        return response.data;
    }
}

// API для робочих місць
class WorkspacesAPI extends ApiClient {
    constructor() {
        super();
    }

    async getAll() {
        const response = await this.get('/workspaces');
        return response.data;
    }

    async getById(id) {
        const response = await this.get(`/workspaces/${id}`);
        return response.data;
    }

    async create(workspaceData) {
        const response = await this.post('/workspaces', workspaceData);
        return response.data;
    }

    async updateStatus(id, isActive) {
        const response = await this.patch(`/workspaces/${id}/status`, { is_active: isActive });
        return response.data;
    }
}

// API для бронювань
class BookingsAPI extends ApiClient {
    constructor() {
        super();
    }

    async getAll() {
        const response = await this.get('/bookings');
        return response.data;
    }

    async getById(id) {
        const response = await this.get(`/bookings/${id}`);
        return response.data;
    }

    async getUserBookings(userId) {
        const response = await this.get(`/bookings/user/${userId}`);
        return response.data;
    }

    async create(bookingData) {
        const response = await this.post('/bookings', bookingData);
        return response.data;
    }

    async cancel(id) {
        const response = await this.post(`/bookings/${id}/cancel`, {});
        return response.data;
    }

    async markAsPaid(id) {
        const response = await this.post(`/bookings/${id}/pay`, {});
        return response.data;
    }
}

// API для абонементів
class SubscriptionsAPI extends ApiClient {
    constructor() {
        super();
    }

    async getAll() {
        const response = await this.get('/subscriptions');
        return response.data;
    }

    async getById(id) {
        const response = await this.get(`/subscriptions/${id}`);
        return response.data;
    }

    async getUserSubscriptions(userId) {
        const response = await this.get(`/subscriptions/user/${userId}`);
        return response.data;
    }

    async getActiveUserSubscription(userId) {
        const response = await this.get(`/subscriptions/user/${userId}/active`);
        return response.data;
    }

    async create(userId, price, months = 1) {
        const response = await this.post('/subscriptions', { 
            user_id: userId,
            price: price,
            months: months
        });
        return response.data;
    }
}

// Експортуємо екземпляри API
const api = {
    users: new UsersAPI(),
    workspaces: new WorkspacesAPI(),
    bookings: new BookingsAPI(),
    subscriptions: new SubscriptionsAPI()
};