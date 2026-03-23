const App = {
    currentPage: 'dashboard',
    
    init() {
        this.setupEventListeners();
        this.loadPage('dashboard');
    },
    
    setupEventListeners() {
        // Меню
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('active');
        });
        
        document.getElementById('closeSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('active');
        });
        
        // Навігація
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').getAttribute('href').substring(1);
                this.loadPage(page);
                
                // Закриваємо меню на мобільних
                document.getElementById('sidebar').classList.remove('active');
            });
        });
        
        // Кнопка "Створити"
        document.getElementById('createNewBtn').addEventListener('click', () => {
            this.handleCreateNew();
        });
        
        // Обробка зміни URL (для глибоких посилань)
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'dashboard';
            this.loadPage(page);
        });
    },
    
    async loadPage(page) {
        this.currentPage = page;
        
        // Оновлюємо заголовок
        const titles = {
            'dashboard': 'Дашборд',
            'workspaces': 'Робочі місця',
            'bookings': 'Бронювання',
            'subscriptions': 'Абонементи',
            'users': 'Користувачі'
        };
        
        document.getElementById('pageTitle').textContent = titles[page] || 'Дашборд';
        
        // Оновлюємо активний пункт меню
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.classList.remove('active');
        });
        document.querySelector(`.sidebar-nav li[data-page="${page}"]`).classList.add('active');
        
        // Оновлюємо URL хеш
        window.location.hash = page;
        
        // Завантажуємо контент
        const contentWrapper = document.getElementById('contentWrapper');
        contentWrapper.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Завантаження...</div>';
        
        try {
            let content = '';
            
            switch(page) {
                case 'dashboard':
                    content = await this.renderDashboard();
                    break;
                case 'workspaces':
                    content = await WorkspacesComponent.render();
                    break;
                case 'bookings':
                    content = await BookingsComponent.render();
                    break;
                case 'subscriptions':
                    content = await SubscriptionsComponent.render();
                    break;
                case 'users':
                    content = await UsersComponent.render();
                    break;
                default:
                    content = '<div>Сторінку не знайдено</div>';
            }
            
            contentWrapper.innerHTML = content;
            
            // Ініціалізуємо компоненти після завантаження
            this.initPageComponents(page);
            
        } catch (error) {
            contentWrapper.innerHTML = `<div class="error-message">Помилка завантаження: ${error.message}</div>`;
        }
    },
    
    async renderDashboard() {
        try {
            const [users, workspaces, bookings, subscriptions] = await Promise.all([
                api.users.getAll(),
                api.workspaces.getAll(),
                api.bookings.getAll(),
                api.subscriptions.getAll()
            ]);
            
            const now = new Date();
            const activeBookings = bookings.filter(b => 
                b.status === 'active' && new Date(b.end_time) > now
            );
            
            const today = now.toISOString().split('T')[0];
            const todayBookings = bookings.filter(b => 
                b.start_time.startsWith(today)
            );
            
            const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
            
            const revenue = bookings
                .filter(b => b.status === 'paid')
                .reduce((sum, b) => sum + b.final_amount, 0);
            
            return `
                <div class="dashboard">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-info">
                                <h3>Користувачі</h3>
                                <div class="stat-number">${users.length}</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-chair"></i></div>
                            <div class="stat-info">
                                <h3>Робочі місця</h3>
                                <div class="stat-number">${workspaces.filter(w => w.is_active).length}</div>
                                <small>з ${workspaces.length}</small>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                            <div class="stat-info">
                                <h3>Активні бронювання</h3>
                                <div class="stat-number">${activeBookings.length}</div>
                                <small>сьогодні: ${todayBookings.length}</small>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>
                            <div class="stat-info">
                                <h3>Активні абонементи</h3>
                                <div class="stat-number">${activeSubscriptions.length}</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-money-bill"></i></div>
                            <div class="stat-info">
                                <h3>Дохід</h3>
                                <div class="stat-number">${MoneyUtils.format(revenue)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-sections">
                        <div class="dashboard-section">
                            <h3>Останні бронювання</h3>
                            <div class="recent-bookings">
                                ${this.renderRecentBookings(bookings.slice(0, 5))}
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h3>Популярні місця</h3>
                            <div class="popular-workspaces">
                                ${this.renderPopularWorkspaces(workspaces, bookings)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return `<div class="error-message">Помилка завантаження дашборда</div>`;
        }
    },
    
    renderRecentBookings(bookings) {
        if (bookings.length === 0) {
            return '<p>Немає бронювань</p>';
        }
        
        return bookings.map(booking => `
            <div class="recent-booking-item">
                <div class="booking-info">
                    <span class="booking-user">${booking.user_id.substring(0, 8)}...</span>
                    <span class="booking-time">${DateUtils.formatDateShort(booking.start_time)}</span>
                </div>
                <span class="status-badge ${StatusUtils.getStatusClass(booking.status)}">
                    ${StatusUtils.getStatusText(booking.status)}
                </span>
            </div>
        `).join('');
    },
    
    renderPopularWorkspaces(workspaces, bookings) {
        const workspaceCounts = workspaces.map(workspace => ({
            ...workspace,
            count: bookings.filter(b => b.workspace_id === workspace.id).length
        }));
        
        const popular = workspaceCounts
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        if (popular.length === 0) {
            return '<p>Немає даних</p>';
        }
        
        return popular.map(workspace => `
            <div class="popular-workspace-item">
                <span class="workspace-name">${workspace.name}</span>
                <span class="workspace-count">${workspace.count} бронювань</span>
            </div>
        `).join('');
    },
    
    initPageComponents(page) {
        switch(page) {
            case 'workspaces':
                WorkspacesComponent.init();
                break;
            case 'bookings':
                BookingsComponent.init();
                break;
            case 'subscriptions':
                SubscriptionsComponent.init();
                break;
            case 'users':
                UsersComponent.init();
                break;
        }
    },
    
    handleCreateNew() {
        switch(this.currentPage) {
            case 'workspaces':
                WorkspacesComponent.showCreateForm();
                break;
            case 'bookings':
                BookingsComponent.showCreateForm();
                break;
            case 'subscriptions':
                SubscriptionsComponent.showCreateForm();
                break;
            case 'users':
                UsersComponent.showCreateForm();
                break;
            default:
                // На дашборді - показуємо меню вибору
                this.showCreateMenu();
        }
    },
    
    showCreateMenu() {
        const content = `
            <div class="create-menu">
                <button class="btn btn-primary" onclick="App.loadPage('users'); UsersComponent.showCreateForm()">
                    <i class="fas fa-user-plus"></i> Створити користувача
                </button>
                <button class="btn btn-primary" onclick="App.loadPage('workspaces'); WorkspacesComponent.showCreateForm()">
                    <i class="fas fa-plus-circle"></i> Додати робоче місце
                </button>
                <button class="btn btn-primary" onclick="App.loadPage('bookings'); BookingsComponent.showCreateForm()">
                    <i class="fas fa-calendar-plus"></i> Нове бронювання
                </button>
                <button class="btn btn-primary" onclick="App.loadPage('subscriptions'); SubscriptionsComponent.showCreateForm()">
                    <i class="fas fa-ticket-alt"></i> Оформити абонемент
                </button>
            </div>
        `;
        
        Modal.show('Створити нове', content);
    },
    
    renderCurrentPage() {
        this.loadPage(this.currentPage);
    }
};

// Запускаємо додаток при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});