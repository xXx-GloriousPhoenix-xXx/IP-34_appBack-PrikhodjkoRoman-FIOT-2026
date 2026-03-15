const SubscriptionsComponent = {
    // Константи для абонементів
    PRICES: {
        MONTHLY: 3000,      // 3000 грн/місяць
        QUARTERLY: 8000,    // 8000 грн/квартал (економія 1000 грн)
        YEARLY: 28000       // 28000 грн/рік (економія 8000 грн)
    },

    MONTHS: {
        MONTHLY: 1,
        QUARTERLY: 3,
        YEARLY: 12
    },

    DISCOUNTS: {
        QUARTERLY: 0.11,    // 11% знижки при оплаті за квартал
        YEARLY: 0.22         // 22% знижки при оплаті за рік
    },

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

                <div class="pricing-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    ${this.renderPricingCards()}
                </div>

                <div class="table-responsive">
                    <table class="data-table" id="subscriptionsTable">
                        <thead>
                            <tr>
                                <th>Користувач</th>
                                <th>Тип абонемента</th>
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
            console.error('Помилка в render:', error);
            return `<div class="error-message">Помилка завантаження: ${error.message}</div>`;
        }
    },

    renderPricingCards() {
        return `
            <div class="pricing-card" style="background-color: rgb(108, 106, 206); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <h3>Місячний</h3>
                <div style="font-size: 2rem; font-weight: bold; margin: 15px 0;">${MoneyUtils.format(this.PRICES.MONTHLY)}</div>
                <p>30 днів доступу</p>
                <p>Безлімітне бронювання</p>
                <p>Всі робочі місця</p>
                <button class="btn btn-light" onclick="App.loadPage('subscriptions'); SubscriptionsComponent.showCreateForm()" style="margin-top: 15px; background: white; color: #667eea; border: none;">
                    <i class="fas fa-shopping-cart"></i> Оформити
                </button>
            </div>

            <div class="pricing-card" style="background-color: rgb(242, 124, 197); color: white; padding: 20px; border-radius: 12px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; right: -30px; background: #ffd700; color: #333; padding: 5px 30px; transform: rotate(45deg); font-size: 0.8rem; font-weight: bold;">
                    -11%
                </div>
                <h3>Квартальний</h3>
                <div style="font-size: 2rem; font-weight: bold; margin: 15px 0;">${MoneyUtils.format(this.PRICES.QUARTERLY)}</div>
                <p style="text-decoration: line-through; opacity: 0.8;">${MoneyUtils.format(this.PRICES.MONTHLY * 3)}</p>
                <p>90 днів доступу</p>
                <p>Економія ${MoneyUtils.format(this.PRICES.MONTHLY * 3 - this.PRICES.QUARTERLY)}</p>
                <button class="btn btn-light" onclick="App.loadPage('subscriptions'); SubscriptionsComponent.showCreateForm()" style="margin-top: 15px; background: white; color: #f5576c; border: none;">
                    <i class="fas fa-shopping-cart"></i> Оформити
                </button>
            </div>

            <div class="pricing-card" style="background-color: rgb(77, 139, 152); color: white; padding: 20px; border-radius: 12px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; right: -30px; background: #ffd700; color: #333; padding: 5px 30px; transform: rotate(45deg); font-size: 0.8rem; font-weight: bold;">
                    -22%
                </div>
                <h3>Річний</h3>
                <div style="font-size: 2rem; font-weight: bold; margin: 15px 0;">${MoneyUtils.format(this.PRICES.YEARLY)}</div>
                <p style="text-decoration: line-through; opacity: 0.8;">${MoneyUtils.format(this.PRICES.MONTHLY * 12)}</p>
                <p>365 днів доступу</p>
                <p>Економія ${MoneyUtils.format(this.PRICES.MONTHLY * 12 - this.PRICES.YEARLY)}</p>
                <button class="btn btn-light" onclick="App.loadPage('subscriptions'); SubscriptionsComponent.showCreateForm()" style="margin-top: 15px; background: white; color: #49a09d; border: none;">
                    <i class="fas fa-shopping-cart"></i> Оформити
                </button>
            </div>
        `;
    },

    renderTableRows(subscriptions, userMap) {
        if (!subscriptions || subscriptions.length === 0) {
            return `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 50px;">
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
            
            // Визначаємо тип абонемента за ціною
            let subscriptionType = 'Місячний';
            if (sub.price === this.PRICES.QUARTERLY) subscriptionType = 'Квартальний';
            else if (sub.price === this.PRICES.YEARLY) subscriptionType = 'Річний';
            
            return `
                <tr data-subscription-id="${sub.id}">
                    <td>${user.full_name}</td>
                    <td><span class="status-badge" style="background: #e2e8f0; color: #4a5568;">${subscriptionType}</span></td>
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
                if (subscriptionId) {
                    await this.showDetails(subscriptionId);
                }
            }
        });

        setTimeout(() => {
            const searchInput = document.getElementById('searchSubscription');
            const statusFilter = document.getElementById('filterSubscriptionStatus');
            
            if (searchInput) {
                searchInput.addEventListener('input', () => this.filterSubscriptions());
            }
            
            if (statusFilter) {
                statusFilter.addEventListener('change', () => this.filterSubscriptions());
            }
        }, 100);
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
            const totalDays = Math.ceil((new Date(subscription.expiry_date) - new Date(subscription.activation_date)) / (1000 * 60 * 60 * 24));
            
            // Визначаємо тип абонемента
            let subscriptionType = 'Місячний';
            let months = 1;
            if (subscription.price === this.PRICES.QUARTERLY) {
                subscriptionType = 'Квартальний';
                months = 3;
            } else if (subscription.price === this.PRICES.YEARLY) {
                subscriptionType = 'Річний';
                months = 12;
            }
            
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
                        <p><strong>Тип:</strong> ${subscriptionType} (${months} ${months === 1 ? 'місяць' : months === 3 ? 'місяці' : 'місяців'})</p>
                        <p><strong>ID:</strong> ${subscription.id}</p>
                        <p><strong>Придбано:</strong> ${DateUtils.formatDate(subscription.purchase_date)}</p>
                        <p><strong>Активовано:</strong> ${DateUtils.formatDate(subscription.activation_date)}</p>
                        <p><strong>Діє до:</strong> ${DateUtils.formatDate(subscription.expiry_date)}</p>
                        <p><strong>Тривалість:</strong> ${totalDays} днів</p>
                        ${daysLeft > 0 ? `
                            <p><strong>Залишилось днів:</strong> ${daysLeft}</p>
                            <p><strong>Використано:</strong> ${totalDays - daysLeft} днів</p>
                            <p><strong>Прогрес:</strong> ${Math.round((totalDays - daysLeft) / totalDays * 100)}%</p>
                        ` : ''}
                        <p><strong>Ціна:</strong> ${MoneyUtils.format(subscription.price)}</p>
                        ${subscription.price > this.PRICES.MONTHLY ? `
                            <p><strong>Економія:</strong> ${MoneyUtils.format(
                                subscription.price === this.PRICES.QUARTERLY 
                                    ? this.PRICES.MONTHLY * 3 - this.PRICES.QUARTERLY
                                    : this.PRICES.MONTHLY * 12 - this.PRICES.YEARLY
                            )}</p>
                        ` : ''}
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
            
            const content = `
                <form id="createSubscriptionForm">
                    <div class="form-group">
                        <label for="user_id">Користувач *</label>
                        <select id="user_id" class="form-control" required>
                            <option value="">Виберіть користувача</option>
                            ${users.map(user => `
                                <option value="${user.id}" 
                                    data-user-debt="${user.has_debt}">
                                    ${user.full_name} 
                                    ${user.has_debt ? '(Має борг)' : ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="subscription_type">Тип абонемента *</label>
                        <select id="subscription_type" class="form-control" required>
                            <option value="">Виберіть тип абонемента</option>
                            <option value="monthly" data-price="${this.PRICES.MONTHLY}" data-months="1">
                                Місячний - ${MoneyUtils.format(this.PRICES.MONTHLY)} (1 місяць)
                            </option>
                            <option value="quarterly" data-price="${this.PRICES.QUARTERLY}" data-months="3">
                                Квартальний - ${MoneyUtils.format(this.PRICES.QUARTERLY)} (3 місяці) - економія ${MoneyUtils.format(this.PRICES.MONTHLY * 3 - this.PRICES.QUARTERLY)}
                            </option>
                            <option value="yearly" data-price="${this.PRICES.YEARLY}" data-months="12">
                                Річний - ${MoneyUtils.format(this.PRICES.YEARLY)} (12 місяців) - економія ${MoneyUtils.format(this.PRICES.MONTHLY * 12 - this.PRICES.YEARLY)}
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="pricePreview" style="display: none; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #48bb78;">
                        <h5 style="margin-bottom: 10px; color: #2d3748;">Попередній перегляд:</h5>
                        <p><strong>Тип:</strong> <span id="previewType"></span></p>
                        <p><strong>Термін:</strong> <span id="previewDuration"></span></p>
                        <p><strong>Ціна:</strong> <span id="previewPrice" style="font-size: 1.2rem; font-weight: bold; color: #48bb78;"></span></p>
                        <p><strong>Економія:</strong> <span id="previewSavings" style="color: #f56565;"></span></p>
                    </div>
                    
                    <div class="alert alert-warning" id="debtWarning" style="display: none; padding: 10px; background: #fff3cd; color: #856404; border-radius: 5px; margin-top: 10px;">
                        <i class="fas fa-exclamation-triangle"></i> У користувача є борг. Оформлення абонемента неможливе.
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
                const typeSelect = document.getElementById('subscription_type');
                const selectedOption = typeSelect.options[typeSelect.selectedIndex];
                
                if (!userId) {
                    Toast.error('Виберіть користувача');
                    return;
                }
                
                if (!typeSelect.value) {
                    Toast.error('Виберіть тип абонемента');
                    return;
                }
                
                const price = parseFloat(selectedOption.dataset.price);
                const months = parseInt(selectedOption.dataset.months);
                
                // Перевіряємо чи є борг у користувача
                const selectedUser = users.find(u => u.id === userId);
                if (selectedUser && selectedUser.has_debt) {
                    Toast.error('Неможливо оформити абонемент: у користувача є борг');
                    return;
                }
                
                // Перевіряємо чи немає вже активного абонемента
                try {
                    const activeSub = await api.subscriptions.getActiveUserSubscription(userId);
                    if (activeSub) {
                        Toast.error('Користувач вже має активний абонемент');
                        return;
                    }
                } catch (error) {
                    console.log('Помилка перевірки активного абонемента:', error);
                }
                
                try {
                    await api.subscriptions.create(userId, price, months);
                    Toast.success('Абонемент оформлено');
                    App.renderCurrentPage();
                } catch (error) {
                    Toast.error(error.message);
                }
            });
            
            // Додаємо обробник для попереднього перегляду
            const typeSelect = document.getElementById('subscription_type');
            const pricePreview = document.getElementById('pricePreview');
            const previewType = document.getElementById('previewType');
            const previewDuration = document.getElementById('previewDuration');
            const previewPrice = document.getElementById('previewPrice');
            const previewSavings = document.getElementById('previewSavings');
            
            if (typeSelect) {
                typeSelect.addEventListener('change', () => {
                    const selectedOption = typeSelect.options[typeSelect.selectedIndex];
                    
                    if (typeSelect.value) {
                        const price = parseFloat(selectedOption.dataset.price);
                        const months = parseInt(selectedOption.dataset.months);
                        
                        let typeText = '';
                        let savings = 0;
                        
                        switch(typeSelect.value) {
                            case 'monthly':
                                typeText = 'Місячний';
                                savings = 0;
                                break;
                            case 'quarterly':
                                typeText = 'Квартальний';
                                savings = this.PRICES.MONTHLY * 3 - price;
                                break;
                            case 'yearly':
                                typeText = 'Річний';
                                savings = this.PRICES.MONTHLY * 12 - price;
                                break;
                        }
                        
                        previewType.textContent = typeText;
                        previewDuration.textContent = `${months} ${months === 1 ? 'місяць' : months === 3 ? 'місяці' : 'місяців'}`;
                        previewPrice.textContent = MoneyUtils.format(price);
                        
                        if (savings > 0) {
                            previewSavings.textContent = `Економія ${MoneyUtils.format(savings)}`;
                            previewSavings.style.display = 'inline';
                        } else {
                            previewSavings.style.display = 'none';
                        }
                        
                        pricePreview.style.display = 'block';
                    } else {
                        pricePreview.style.display = 'none';
                    }
                });
            }
            
            // Додаємо обробник для показу попередження про борг
            const userSelect = document.getElementById('user_id');
            const debtWarning = document.getElementById('debtWarning');
            
            if (userSelect) {
                userSelect.addEventListener('change', () => {
                    const selectedOption = userSelect.options[userSelect.selectedIndex];
                    const hasDebt = selectedOption.dataset.userDebt === 'true';
                    
                    if (debtWarning) {
                        debtWarning.style.display = hasDebt ? 'block' : 'none';
                    }
                    
                    const confirmBtn = document.getElementById('modalConfirm');
                    if (confirmBtn) {
                        confirmBtn.disabled = hasDebt;
                    }
                });
            }
            
        } catch (error) {
            console.error('Помилка в showCreateSubscriptionModal:', error);
            Toast.error('Помилка завантаження даних');
        }
    }
};