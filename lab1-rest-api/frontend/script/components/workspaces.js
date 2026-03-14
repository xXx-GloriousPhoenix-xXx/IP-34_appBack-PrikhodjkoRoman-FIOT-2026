const WorkspacesComponent = {
    async render() {
        try {
            const workspaces = await api.workspaces.getAll();
            
            return `
                <div class="filters-bar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Пошук робочих місць..." id="searchWorkspace">
                    </div>
                    <select class="filter-select" id="filterWorkspaceType">
                        <option value="all">Всі типи</option>
                        <option value="desk">Столи</option>
                        <option value="meeting_room">Переговорні</option>
                    </select>
                    <select class="filter-select" id="filterWorkspaceStatus">
                        <option value="all">Всі статуси</option>
                        <option value="active">Активні</option>
                        <option value="inactive">Неактивні</option>
                    </select>
                </div>

                <div class="card-grid" id="workspacesGrid">
                    ${this.renderCards(workspaces)}
                </div>
            `;
        } catch (error) {
            return `<div class="error-message">Помилка завантаження: ${error.message}</div>`;
        }
    },

    renderCards(workspaces) {
        if (!workspaces || workspaces.length === 0) {
            return `
                <div class="no-data">
                    <p>Немає робочих місць</p>
                </div>
            `;
        }

        return workspaces.map(workspace => `
            <div class="card" data-workspace-id="${workspace.id}">
                <div class="card-header">
                    <h3>${workspace.name}</h3>
                    <span class="status-badge ${workspace.is_active ? 'status-active' : 'status-cancelled'}">
                        ${workspace.is_active ? 'Активно' : 'Неактивно'}
                    </span>
                </div>
                
                <div class="card-body">
                    <p><i class="fas fa-tag"></i> Тип: ${StatusUtils.getStatusText(workspace.type)}</p>
                    <p><i class="fas fa-users"></i> Місткість: ${workspace.capacity} осіб</p>
                    <p><i class="fas fa-money-bill"></i> Ціна: ${MoneyUtils.format(workspace.price_per_hour)}/год</p>
                </div>
                
                <div class="card-footer">
                    <button class="btn btn-secondary btn-sm toggle-status" data-workspace-id="${workspace.id}" data-active="${workspace.is_active}">
                        <i class="fas ${workspace.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        ${workspace.is_active ? 'Деактивувати' : 'Активувати'}
                    </button>
                    <button class="btn btn-primary btn-sm view-workspace-bookings" data-workspace-id="${workspace.id}">
                        <i class="fas fa-calendar"></i> Переглянути бронювання
                    </button>
                </div>
            </div>
        `).join('');
    },

    init() {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.toggle-status')) {
                const btn = e.target.closest('.toggle-status');
                const workspaceId = btn.dataset.workspaceId;
                const isActive = btn.dataset.active === 'true';
                
                await this.toggleStatus(workspaceId, !isActive);
            }
            
            if (e.target.closest('.view-workspace-bookings')) {
                const workspaceId = e.target.closest('.view-workspace-bookings').dataset.workspaceId;
                this.showWorkspaceBookings(workspaceId);
            }
        });

        // Фільтрація
        const searchInput = document.getElementById('searchWorkspace');
        const typeFilter = document.getElementById('filterWorkspaceType');
        const statusFilter = document.getElementById('filterWorkspaceStatus');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterWorkspaces());
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterWorkspaces());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterWorkspaces());
        }
    },

    async filterWorkspaces() {
        const searchTerm = document.getElementById('searchWorkspace')?.value.toLowerCase() || '';
        const typeValue = document.getElementById('filterWorkspaceType')?.value || 'all';
        const statusValue = document.getElementById('filterWorkspaceStatus')?.value || 'all';
        
        try {
            const workspaces = await api.workspaces.getAll();
            
            const filtered = workspaces.filter(workspace => {
                // Пошук
                const matchesSearch = workspace.name.toLowerCase().includes(searchTerm);
                
                // Фільтр за типом
                const matchesType = typeValue === 'all' || workspace.type === typeValue;
                
                // Фільтр за статусом
                let matchesStatus = true;
                if (statusValue === 'active') matchesStatus = workspace.is_active;
                if (statusValue === 'inactive') matchesStatus = !workspace.is_active;
                
                return matchesSearch && matchesType && matchesStatus;
            });
            
            const grid = document.getElementById('workspacesGrid');
            if (grid) {
                grid.innerHTML = this.renderCards(filtered);
            }
        } catch (error) {
            Toast.error('Помилка фільтрації');
        }
    },

    async toggleStatus(workspaceId, newStatus) {
        try {
            await api.workspaces.updateStatus(workspaceId, newStatus);
            Toast.success(`Робоче місце ${newStatus ? 'активовано' : 'деактивовано'}`);
            this.filterWorkspaces(); // Оновити список
        } catch (error) {
            Toast.error('Помилка зміни статусу');
        }
    },

    async showWorkspaceBookings(workspaceId) {
        try {
            const [workspace, allBookings] = await Promise.all([
                api.workspaces.getById(workspaceId),
                api.bookings.getAll()
            ]);
            
            const bookings = allBookings.filter(b => b.workspace_id === workspaceId);
            
            const content = `
                <h4>Бронювання для ${workspace.name}</h4>
                <div class="bookings-list">
                    ${bookings.map(booking => `
                        <div class="booking-item">
                            <p><strong>Час:</strong> ${DateUtils.formatDate(booking.start_time)} - ${DateUtils.formatTime(booking.end_time)}</p>
                            <p><strong>Користувач:</strong> ${booking.user_id.substring(0, 8)}...</p>
                            <p><strong>Статус:</strong> <span class="status-badge ${StatusUtils.getStatusClass(booking.status)}">${StatusUtils.getStatusText(booking.status)}</span></p>
                            <p><strong>Сума:</strong> ${MoneyUtils.format(booking.final_amount)}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            Modal.show('Бронювання місця', content);
        } catch (error) {
            Toast.error('Помилка завантаження бронювань');
        }
    },

    showCreateForm() {
        const content = `
            <form id="createWorkspaceForm">
                <div class="form-group">
                    <label for="name">Назва *</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="type">Тип *</label>
                    <select id="type" class="form-control" required>
                        <option value="desk">Стіл</option>
                        <option value="meeting_room">Переговорна</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="capacity">Місткість *</label>
                    <input type="number" id="capacity" class="form-control" required min="1" max="50">
                </div>
                
                <div class="form-group">
                    <label for="price_per_hour">Ціна за годину (грн) *</label>
                    <input type="number" id="price_per_hour" class="form-control" required min="0" step="0.01">
                </div>
            </form>
        `;
        
        Modal.show('Створити робоче місце', content, async () => {
            const form = document.getElementById('createWorkspaceForm');
            const formData = {
                name: form.name.value,
                type: form.type.value,
                capacity: parseInt(form.capacity.value),
                price_per_hour: parseFloat(form.price_per_hour.value)
            };
            
            try {
                await api.workspaces.create(formData);
                Toast.success('Робоче місце створено');
                App.renderCurrentPage();
            } catch (error) {
                Toast.error(error.message);
            }
        });
    }
};