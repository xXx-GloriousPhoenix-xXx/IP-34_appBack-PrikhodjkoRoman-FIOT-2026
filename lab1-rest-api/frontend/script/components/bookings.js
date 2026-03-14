const BookingsComponent = {
    async render() {
        try {
            const [bookings, workspaces, users] = await Promise.all([
                api.bookings.getAll(),
                api.workspaces.getAll(),
                api.users.getAll()
            ]);
            
            // Створюємо мапи для швидкого доступу
            const workspaceMap = workspaces.reduce((acc, w) => ({ ...acc, [w.id]: w }), {});
            const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            
            return `
                <div class="filters-bar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Пошук бронювань..." id="searchBooking">
                    </div>
                    <select class="filter-select" id="filterBookingStatus">
                        <option value="all">Всі статуси</option>
                        <option value="pending">Очікують</option>
                        <option value="active">Активні</option>
                        <option value="paid">Оплачені</option>
                        <option value="cancelled">Скасовані</option>
                    </select>
                </div>

                <div class="table-responsive">
                    <table class="data-table" id="bookingsTable">
                        <thead>
                            <tr>
                                <th>Користувач</th>
                                <th>Місце</th>
                                <th>Час</th>
                                <th>Тривалість</th>
                                <th>Сума</th>
                                <th>Статус</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTableRows(bookings, workspaceMap, userMap)}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return `<div class="error-message">Помилка завантаження: ${error.message}</div>`;
        }
    },

    renderTableRows(bookings, workspaceMap, userMap) {
        if (!bookings || bookings.length === 0) {
            return `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 50px;">
                        <i class="fas fa-calendar-times" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 10px;"></i>
                        <p>Немає бронювань</p>
                    </td>
                </tr>
            `;
        }

        return bookings.map(booking => {
            const workspace = workspaceMap[booking.workspace_id] || { name: 'Невідомо' };
            const user = userMap[booking.user_id] || { full_name: 'Невідомо' };
            const hours = DateUtils.getHoursDifference(booking.start_time, booking.end_time);
            
            return `
                <tr data-booking-id="${booking.id}">
                    <td>${user.full_name}</td>
                    <td>${workspace.name}</td>
                    <td>
                        ${DateUtils.formatDateShort(booking.start_time)}<br>
                        <small>${DateUtils.formatTime(booking.start_time)} - ${DateUtils.formatTime(booking.end_time)}</small>
                    </td>
                    <td>${hours.toFixed(1)} год</td>
                    <td>${MoneyUtils.format(booking.final_amount)}</td>
                    <td>
                        <span class="status-badge ${StatusUtils.getStatusClass(booking.status)}">
                            ${StatusUtils.getStatusText(booking.status)}
                        </span>
                    </td>
                    <td>
                        ${booking.status === 'pending' ? `
                            <button class="btn btn-success btn-sm mark-paid" data-booking-id="${booking.id}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger btn-sm cancel-booking" data-booking-id="${booking.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-sm view-booking-details" data-booking-id="${booking.id}">
                            <i class="fas fa-info"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    init() {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.mark-paid')) {
                const bookingId = e.target.closest('.mark-paid').dataset.bookingId;
                await this.markAsPaid(bookingId);
            }
            
            if (e.target.closest('.cancel-booking')) {
                const bookingId = e.target.closest('.cancel-booking').dataset.bookingId;
                await this.cancelBooking(bookingId);
            }
            
            if (e.target.closest('.view-booking-details')) {
                const bookingId = e.target.closest('.view-booking-details').dataset.bookingId;
                this.showDetails(bookingId);
            }
        });

        // Фільтрація
        const searchInput = document.getElementById('searchBooking');
        const statusFilter = document.getElementById('filterBookingStatus');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterBookings());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterBookings());
        }
    },

    async filterBookings() {
        const searchTerm = document.getElementById('searchBooking')?.value.toLowerCase() || '';
        const statusValue = document.getElementById('filterBookingStatus')?.value || 'all';
        
        try {
            const [bookings, workspaces, users] = await Promise.all([
                api.bookings.getAll(),
                api.workspaces.getAll(),
                api.users.getAll()
            ]);
            
            const workspaceMap = workspaces.reduce((acc, w) => ({ ...acc, [w.id]: w }), {});
            const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            
            const filtered = bookings.filter(booking => {
                const user = userMap[booking.user_id] || { full_name: '' };
                const workspace = workspaceMap[booking.workspace_id] || { name: '' };
                
                const matchesSearch = user.full_name.toLowerCase().includes(searchTerm) ||
                                     workspace.name.toLowerCase().includes(searchTerm);
                
                const matchesStatus = statusValue === 'all' || booking.status === statusValue;
                
                return matchesSearch && matchesStatus;
            });
            
            const tbody = document.querySelector('#bookingsTable tbody');
            if (tbody) {
                tbody.innerHTML = this.renderTableRows(filtered, workspaceMap, userMap);
            }
        } catch (error) {
            Toast.error('Помилка фільтрації');
        }
    },

    async markAsPaid(bookingId) {
        try {
            await api.bookings.markAsPaid(bookingId);
            Toast.success('Бронювання позначено як оплачене');
            this.filterBookings();
        } catch (error) {
            Toast.error('Помилка оплати: ' + error.message);
        }
    },

    async cancelBooking(bookingId) {
        if (!confirm('Ви впевнені, що хочете скасувати це бронювання?')) {
            return;
        }
        
        try {
            await api.bookings.cancel(bookingId);
            Toast.success('Бронювання скасовано');
            this.filterBookings();
        } catch (error) {
            Toast.error('Помилка скасування: ' + error.message);
        }
    },

    async showDetails(bookingId) {
        try {
            const booking = await api.bookings.getById(bookingId);
            const [user, workspace] = await Promise.all([
                api.users.getById(booking.user_id),
                api.workspaces.getById(booking.workspace_id)
            ]);
            
            const hours = DateUtils.getHoursDifference(booking.start_time, booking.end_time);
            const discountInfo = MoneyUtils.calculateDiscount(hours, booking.base_amount);
            
            const content = `
                <div class="booking-details">
                    <h4>Деталі бронювання</h4>
                    
                    <div class="detail-group">
                        <h5>Користувач</h5>
                        <p><strong>Ім'я:</strong> ${user.full_name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Телефон:</strong> ${user.phone}</p>
                    </div>
                    
                    <div class="detail-group">
                        <h5>Робоче місце</h5>
                        <p><strong>Назва:</strong> ${workspace.name}</p>
                        <p><strong>Тип:</strong> ${StatusUtils.getStatusText(workspace.type)}</p>
                        <p><strong>Ціна:</strong> ${MoneyUtils.format(workspace.price_per_hour)}/год</p>
                    </div>
                    
                    <div class="detail-group">
                        <h5>Час</h5>
                        <p><strong>Початок:</strong> ${DateUtils.formatDate(booking.start_time)}</p>
                        <p><strong>Закінчення:</strong> ${DateUtils.formatDate(booking.end_time)}</p>
                        <p><strong>Тривалість:</strong> ${hours.toFixed(1)} годин</p>
                    </div>
                    
                    <div class="detail-group">
                        <h5>Фінанси</h5>
                        <p><strong>Базова сума:</strong> ${MoneyUtils.format(booking.base_amount)}</p>
                        ${discountInfo.discountPercent > 0 ? `
                            <p><strong>Знижка:</strong> ${discountInfo.discountPercent}% (${MoneyUtils.format(discountInfo.discountAmount)})</p>
                        ` : ''}
                        <p><strong>До сплати:</strong> ${MoneyUtils.format(booking.final_amount)}</p>
                    </div>
                    
                    <div class="detail-group">
                        <h5>Статус</h5>
                        <p>
                            <span class="status-badge ${StatusUtils.getStatusClass(booking.status)}">
                                ${StatusUtils.getStatusText(booking.status)}
                            </span>
                        </p>
                        <p><strong>Створено:</strong> ${DateUtils.formatDate(booking.created_at)}</p>
                    </div>
                </div>
            `;
            
            Modal.show('Деталі бронювання', content);
        } catch (error) {
            Toast.error('Помилка завантаження деталей');
        }
    },

    showCreateForm() {
        this.showCreateBookingModal();
    },

    async showCreateBookingModal() {
        try {
            const [users, workspaces] = await Promise.all([
                api.users.getAll(),
                api.workspaces.getAll()
            ]);
            
            const activeWorkspaces = workspaces.filter(w => w.is_active);
            
            const content = `
                <form id="createBookingForm">
                    <div class="form-group">
                        <label for="user_id">Користувач *</label>
                        <select id="user_id" class="form-control" required>
                            <option value="">Виберіть користувача</option>
                            ${users.map(user => `
                                <option value="${user.id}" data-user-debt="${user.has_debt}">
                                    ${user.full_name} ${user.has_debt ? '(Є борг)' : ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="workspace_id">Робоче місце *</label>
                        <select id="workspace_id" class="form-control" required>
                            <option value="">Виберіть місце</option>
                            ${activeWorkspaces.map(workspace => `
                                <option value="${workspace.id}" data-price="${workspace.price_per_hour}">
                                    ${workspace.name} - ${MoneyUtils.format(workspace.price_per_hour)}/год
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="start_time">Час початку *</label>
                        <input type="datetime-local" id="start_time" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="end_time">Час закінчення *</label>
                        <input type="datetime-local" id="end_time" class="form-control" required>
                    </div>
                    
                    <div class="form-group" id="pricePreview" style="display: none;">
                        <label>Попередній розрахунок:</label>
                        <div id="priceDetails"></div>
                    </div>
                    
                    <div class="form-group">
                        <small>* Мінімальний час бронювання - 30 хвилин</small><br>
                        <small>* При бронюванні більше 4 годин - знижка 10%</small>
                    </div>
                </form>
            `;
            
            Modal.show('Нове бронювання', content, async () => {
                const form = document.getElementById('createBookingForm');
                
                // Валідація
                const userId = form.user_id.value;
                const user = users.find(u => u.id === userId);
                
                if (user && user.has_debt) {
                    if (!confirm('Користувач має борг. Продовжити створення бронювання?')) {
                        return;
                    }
                }
                
                // Перевірка часу
                const startTime = new Date(form.start_time.value);
                const endTime = new Date(form.end_time.value);
                const now = new Date();
                
                const timeError = ValidationUtils.validateTimeRange(startTime, endTime);
                if (timeError) {
                    Toast.error(timeError);
                    return;
                }
                
                const bookingData = {
                    user_id: userId,
                    workspace_id: form.workspace_id.value,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString()
                };
                
                try {
                    await api.bookings.create(bookingData);
                    Toast.success('Бронювання створено');
                    App.renderCurrentPage();
                } catch (error) {
                    Toast.error(error.message);
                }
            });
            
            // Додаємо попередній перегляд ціни
            const startInput = document.getElementById('start_time');
            const endInput = document.getElementById('end_time');
            const workspaceSelect = document.getElementById('workspace_id');
            const pricePreview = document.getElementById('pricePreview');
            const priceDetails = document.getElementById('priceDetails');
            
            const updatePricePreview = () => {
                if (startInput.value && endInput.value && workspaceSelect.value) {
                    const start = new Date(startInput.value);
                    const end = new Date(endInput.value);
                    const hours = DateUtils.getHoursDifference(start, end);
                    
                    if (hours >= 0.5) {
                        const selectedOption = workspaceSelect.options[workspaceSelect.selectedIndex];
                        const pricePerHour = parseFloat(selectedOption.dataset.price);
                        const baseAmount = pricePerHour * hours;
                        const discount = MoneyUtils.calculateDiscount(hours, baseAmount);
                        
                        priceDetails.innerHTML = `
                            <p>Годин: ${hours.toFixed(1)}</p>
                            <p>Базова сума: ${MoneyUtils.format(baseAmount)}</p>
                            ${discount.discountPercent > 0 ? `
                                <p>Знижка: ${discount.discountPercent}% (${MoneyUtils.format(discount.discountAmount)})</p>
                                <p><strong>До сплати: ${MoneyUtils.format(discount.finalAmount)}</strong></p>
                            ` : `
                                <p><strong>До сплати: ${MoneyUtils.format(baseAmount)}</strong></p>
                            `}
                        `;
                        
                        pricePreview.style.display = 'block';
                    } else {
                        pricePreview.style.display = 'none';
                    }
                } else {
                    pricePreview.style.display = 'none';
                }
            };
            
            startInput.addEventListener('change', updatePricePreview);
            endInput.addEventListener('change', updatePricePreview);
            workspaceSelect.addEventListener('change', updatePricePreview);
            
        } catch (error) {
            Toast.error('Помилка завантаження даних');
        }
    }
};