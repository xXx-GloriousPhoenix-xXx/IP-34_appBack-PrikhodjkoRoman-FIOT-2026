const SubscriptionsComponent = {
    async render() {
        try {
            const [subscriptions, users] = await Promise.all([
                api.subscriptions.getAll(),
                api.users.getAll()
            ]);
            
            const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            
            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>
                        <div class="stat-info">
                            <h3>Всього абонементів</h3>
                            <div class="stat-number">${subscriptions.length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <h3>Активних</h3>
                            <div class="stat-number">${subscriptions.filter(s => s.status === 'active').length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-info">
                            <h3>Закінчились</h3>
                            <div class="stat-number">${subscriptions.filter(s => s.status === 'expired').length}</div>
                        </div>
                    </div>
                </div>

                <div class="filters-bar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Пошук абонементів..." id="searchSubscription">
                    </div>
                    <select class="filter-select" id="filterSubscriptionStatus">
                        <option value="all">Всі статуси</option>
                        <option value="active">Активні</option>
                        <option value="expired">Закінчились</option>
                    </select>
                </div>

                <div class="table-responsive">
                    <table class="data-table" id="subscriptionsTable">
                        <thead>
                            <tr>
                                <th>Користувач</th>
                                <th>Дата покупки</th>
                                <th>Діє до</th>
                                <th>Ціна</th>
                                <th>Статус</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTableRows(subscriptions, userMap)}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return `<div class="error-message">Помилка завантаження: ${error.message}</div>`;
        }
    },

    renderTableRows(subscriptions, userMap) {
        if (!subscriptions || subscriptions.length === 0) {
            return `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 50px;">
                        <i class="fas fa-ticket-alt" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 10px;"></i>
                        <p>Немає абонементів</p>
                    </td>
                </tr>
            `;
        }

        return subscriptions.map(sub => {
            const user = userMap[sub.user_id] || { full_name: 'Невідомо' };
            const now = new Date();
            const expiryDate = new Date(sub.expiry_date);
            const isExpiringSoon = expiryDate > now && (expiryDate - now) / (1000 * 60 * 60 * 24) < 3;
            
            return `
                <tr data-subscription-id="${sub.id}">
                    <td>${user.full_name}</td>
                    <td>${DateUtils.formatDateShort(sub.purchase_date)}</td>
                    <td>
                        ${DateUtils.formatDateShort(sub.expiry_date)}
                        ${isExpiringSoon ? '<span class="status-badge status-pending" style="margin-left: 5px;">Скоро закінчиться</span>' : ''}
                    </td>
                    <td>${MoneyUtils.format(sub.price)}</td>
                    <td>
                        <span class="status-badge ${StatusUtils.getStatusClass(sub.status)}">
                            ${StatusUtils.getStatusText(sub.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm view-subscription-details" data-subscription-id="${sub.id}">
                            <i class="fas fa-info"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    init() {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.view-subscription-details')) {
                const subscriptionId = e.target.closest('.view-subscription-details').dataset.subscriptionId;
                this.showDetails(subscriptionId);
            }
        });

        // Фільтрація
        const searchInput = document.getElementById('searchSubscription');
        const statusFilter = document.getElementById('filterSubscriptionStatus');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterSubscriptions());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterSubscriptions());
        }
    },

    async filterSubscriptions() {
        const searchTerm = document.getElementById('searchSubscription')?.value.toLowerCase() || '';
        const statusValue = document.getElementById('filterSubscriptionStatus')?.value || 'all';
        
        try {
            const [subscriptions, users] = await Promise.all([
                api.subscriptions.getAll(),
                api.users.getAll()
            ]);
            
            const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            
            const filtered = subscriptions.filter(sub => {
                const user = userMap[sub.user_id] || { full_name: '' };
                const matchesSearch = user.full_name.toLowerCase().includes(searchTerm);
                
                const matchesStatus = statusValue === 'all' || sub.status === statusValue;
                
                return matchesSearch && matchesStatus;
            });
            
            const tbody = document.querySelector('#subscriptionsTable tbody');
            if (tbody) {
                tbody.innerHTML = this.renderTableRows(filtered, userMap);
            }
        } catch (error) {
            Toast.error('Помилка фільтрації');
        }
    },

    async showDetails(subscriptionId) {
        try {
            const subscription = await api.subscriptions.getById(subscriptionId);
            const user = await api.users.getById(subscription.user_id);
            
            const daysLeft = Math.ceil((new Date(subscription.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            
            const content = `
                <div class="subscription-details">
                    <h4>Деталі абонемента</h4>
                    
                    <div class="detail-group">
                        <h5>Користувач</h5>
                        <p><strong>Ім'я:</strong> ${user.full_name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Телефон:</strong> ${user.phone}</p>
                        ${user.has_debt ? '<p class="text-danger">Має борг</p>' : ''}
                    </div>
                    
                    <div class="detail-group">
                        <h5>Інформація про абонемент</h5>
                        <p><strong>ID:</strong> ${subscription.id}</p>
                        <p><strong>Придбано:</strong> ${DateUtils.formatDate(subscription.purchase_date)}</p>
                        <p><strong>Активовано:</strong> ${DateUtils.formatDate(subscription.activation_date)}</p>
                        <p><strong>Діє до:</strong> ${DateUtils.formatDate(subscription.expiry_date)}</p>
                        ${daysLeft > 0 ? `
                            <p><strong>Залишилось днів:</strong> ${daysLeft}</p>
                        ` : ''}
                        <p><strong>Ціна:</strong> ${MoneyUtils.format(subscription.price)}</p>
                    </div>
                    
                    <div class="detail-group">
                        <h5>Статус</h5>
                        <p>
                            <span class="status-badge ${StatusUtils.getStatusClass(subscription.status)}">
                                ${StatusUtils.getStatusText(subscription.status)}
                            </span>
                        </p>
                        ${subscription.is_active ? '<p class="text-success">Абонемент активний</p>' : ''}
                    </div>
                </div>
            `;
            
            Modal.show('Деталі абонемента', content);
        } catch (error) {
            Toast.error('Помилка завантаження деталей');
        }
    },

    showCreateForm() {
        this.showCreateSubscriptionModal();
    },

    async showCreateSubscriptionModal() {
        try {
            const users = await api.users.getAll();
            const usersWithoutDebt = users.filter(u => !u.has_debt);
            const usersWithActiveSub = [];
            
            // Перевіряємо в кого є активні абонементи
            for (const user of usersWithoutDebt) {
                const activeSub = await api.subscriptions.getActiveUserSubscription(user.id);
                if (activeSub) {
                    usersWithActiveSub.push(user.id);
                }
            }
            
            const availableUsers = usersWithoutDebt.filter(u => !usersWithActiveSub.includes(u.id));
            
            const content = `
                <form id="createSubscriptionForm">
                    <div class="form-group">
                        <label for="user_id">Користувач *</label>
                        <select id="user_id" class="form-control" required>
                            <option value="">Виберіть користувача</option>
                            ${users.map(user => `
                                <option value="${user.id}" 
                                    ${user.has_debt ? 'disabled' : ''}
                                    ${usersWithActiveSub.includes(user.id) ? 'disabled' : ''}>
                                    ${user.full_name} 
                                    ${user.has_debt ? '(Має борг)' : ''}
                                    ${usersWithActiveSub.includes(user.id) ? '(Вже має активний абонемент)' : ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Вартість абонемента</label>
                        <p><strong>3000 грн</strong> за 30 днів</p>
                    </div>
                    
                    <div class="form-group">
                        <small>* Абонемент активується одразу після покупки</small><br>
                        <small>* Для покупки абонемента у користувача не повинно бути боргів</small><br>
                        <small>* Користувач може мати лише один активний абонемент</small>
                    </div>
                </form>
            `;
            
            Modal.show('Оформити абонемент', content, async () => {
                const form = document.getElementById('createSubscriptionForm');
                const userId = form.user_id.value;
                
                if (!userId) {
                    Toast.error('Виберіть користувача');
                    return;
                }
                
                try {
                    await api.subscriptions.create(userId);
                    Toast.success('Абонемент оформлено');
                    App.renderCurrentPage();
                } catch (error) {
                    Toast.error(error.message);
                }
            });
            
        } catch (error) {
            Toast.error('Помилка завантаження даних');
        }
    }
};