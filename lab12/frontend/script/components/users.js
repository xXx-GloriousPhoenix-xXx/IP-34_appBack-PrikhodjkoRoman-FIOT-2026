const UsersComponent = {
    async render() {
        try {
            const users = await api.users.getAll();
            
            return `
                <div class="filters-bar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Пошук користувачів..." id="searchUser">
                    </div>
                    <select class="filter-select" id="filterUserDebt">
                        <option value="all">Всі користувачі</option>
                        <option value="withDebt">З боргами</option>
                        <option value="withoutDebt">Без боргів</option>
                    </select>
                </div>

                <div class="table-responsive">
                    <table class="data-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>Ім'я</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Вік</th>
                                <th>Дата реєстрації</th>
                                <th>Статус</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTableRows(users)}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return `<div class="error-message">Помилка завантаження: ${error.message}</div>`;
        }
    },

    renderTableRows(users) {
        if (!users || users.length === 0) {
            return `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 50px;">
                        <i class="fas fa-users" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 10px;"></i>
                        <p>Немає користувачів</p>
                    </td>
                </tr>
            `;
        }

        return users.map(user => `
            <tr data-user-id="${user.id}">
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.age}</td>
                <td>${DateUtils.formatDateShort(user.registration_date)}</td>
                <td>
                    <span class="status-badge ${user.has_debt ? 'status-cancelled' : 'status-active'}">
                        ${user.has_debt ? 'Є борг' : 'Без боргів'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm view-user-bookings" data-user-id="${user.id}">
                        <i class="fas fa-calendar"></i>
                    </button>
                    <button class="btn btn-primary btn-sm view-user-subscriptions" data-user-id="${user.id}">
                        <i class="fas fa-ticket-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    init() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-user-bookings')) {
                const userId = e.target.closest('.view-user-bookings').dataset.userId;
                this.showUserBookings(userId);
            }
            
            if (e.target.closest('.view-user-subscriptions')) {
                const userId = e.target.closest('.view-user-subscriptions').dataset.userId;
                this.showUserSubscriptions(userId);
            }
        });

        // Фільтрація
        const searchInput = document.getElementById('searchUser');
        const filterSelect = document.getElementById('filterUserDebt');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterUsers());
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterUsers());
        }
    },

    async filterUsers() {
        const searchTerm = document.getElementById('searchUser')?.value.toLowerCase() || '';
        const filterValue = document.getElementById('filterUserDebt')?.value || 'all';
        
        try {
            const users = await api.users.getAll();
            
            const filteredUsers = users.filter(user => {
                // Пошук
                const matchesSearch = user.full_name.toLowerCase().includes(searchTerm) ||
                                     user.email.toLowerCase().includes(searchTerm) ||
                                     user.phone.includes(searchTerm);
                
                // Фільтр за боргами
                if (filterValue === 'withDebt') return matchesSearch && user.has_debt;
                if (filterValue === 'withoutDebt') return matchesSearch && !user.has_debt;
                
                return matchesSearch;
            });
            
            const tbody = document.querySelector('#usersTable tbody');
            if (tbody) {
                tbody.innerHTML = this.renderTableRows(filteredUsers);
            }
        } catch (error) {
            Toast.error('Помилка фільтрації');
        }
    },

    async showUserBookings(userId) {
        try {
            const [user, bookings] = await Promise.all([
                api.users.getById(userId),
                api.bookings.getUserBookings(userId)
            ]);
            
            const content = `
                <h4>Бронювання користувача ${user.full_name}</h4>
                <div class="bookings-list">
                    ${bookings.map(booking => `
                        <div class="booking-item">
                            <p><strong>ID:</strong> ${booking.id.substring(0, 8)}...</p>
                            <p><strong>Час:</strong> ${DateUtils.formatDate(booking.start_time)} - ${DateUtils.formatTime(booking.end_time)}</p>
                            <p><strong>Сума:</strong> ${MoneyUtils.format(booking.final_amount)}</p>
                            <p><strong>Статус:</span> <span class="status-badge ${StatusUtils.getStatusClass(booking.status)}">${StatusUtils.getStatusText(booking.status)}</span></p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            Modal.show('Бронювання користувача', content);
        } catch (error) {
            Toast.error('Помилка завантаження бронювань');
        }
    },

    async showUserSubscriptions(userId) {
        try {
            const [user, subscriptions] = await Promise.all([
                api.users.getById(userId),
                api.subscriptions.getUserSubscriptions(userId)
            ]);
            
            const activeSub = await api.subscriptions.getActiveUserSubscription(userId);
            
            const content = `
                <h4>Абонементи користувача ${user.full_name}</h4>
                ${activeSub ? `
                    <div class="active-subscription">
                        <h5>Активний абонемент</h5>
                        <p>Діє до: ${DateUtils.formatDate(activeSub.expiry_date)}</p>
                    </div>
                ` : '<p>Немає активного абонемента</p>'}
                
                <h5>Історія абонементів</h5>
                <div class="subscriptions-list">
                    ${subscriptions.map(sub => `
                        <div class="subscription-item">
                            <p><strong>Придбано:</strong> ${DateUtils.formatDateShort(sub.purchase_date)}</p>
                            <p><strong>Діє до:</strong> ${DateUtils.formatDateShort(sub.expiry_date)}</p>
                            <p><strong>Ціна:</strong> ${MoneyUtils.format(sub.price)}</p>
                            <p><strong>Статус:</strong> <span class="status-badge ${StatusUtils.getStatusClass(sub.status)}">${StatusUtils.getStatusText(sub.status)}</span></p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            Modal.show('Абонементи користувача', content);
        } catch (error) {
            Toast.error('Помилка завантаження абонементів');
        }
    },

    showCreateForm() {
        const content = `
            <form id="createUserForm">
                <div class="form-group">
                    <label for="full_name">Повне ім'я *</label>
                    <input type="text" id="full_name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="phone">Телефон *</label>
                    <input type="tel" id="phone" class="form-control" required placeholder="+380991234567">
                </div>
                
                <div class="form-group">
                    <label for="age">Вік *</label>
                    <input type="number" id="age" class="form-control" required min="16" max="120">
                </div>
            </form>
        `;
        
        Modal.show('Створити користувача', content, async () => {
            const form = document.getElementById('createUserForm');
            const formData = {
                full_name: form.full_name.value,
                email: form.email.value,
                phone: form.phone.value,
                age: parseInt(form.age.value)
            };
            
            // Валідація
            if (!ValidationUtils.validateEmail(formData.email)) {
                Toast.error('Невірний формат email');
                return;
            }
            
            if (!ValidationUtils.validatePhone(formData.phone)) {
                Toast.error('Невірний формат телефону');
                return;
            }
            
            if (!ValidationUtils.validateAge(formData.age)) {
                Toast.error('Вік має бути від 16 до 120 років');
                return;
            }
            
            try {
                await api.users.create(formData);
                Toast.success('Користувача створено');
                App.renderCurrentPage(); // Перерендерити поточну сторінку
            } catch (error) {
                Toast.error(error.message);
            }
        });
    }
};