const AuthComponent = {
    // Состояние компонента: 'login' или 'register'
    mode: 'login',

    async render() {
        return `
            <div class="auth-screen" style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: calc(100vh - 80px);
                width: 100%;
                font-size: 0.8em;
            ">
                <div class="auth-container" style="width: 100%; max-width: 400px;">
                    <div class="card">
                        <div class="card-header" style="text-align: center; margin-bottom: 20px;">
                            <h2 id="authTitle">${this.mode === 'login' ? 'Вхід в систему' : 'Реєстрація'}</h2>
                            <p style="color: #718096;">${this.mode === 'login' ? 'Введіть свої дані для доступу' : 'Створіть новий аккаунт'}</p>
                        </div>
                        
                        <form id="authForm">
                            ${this.mode === 'register' ? `
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label for="full_name">Повне ім'я *</label>
                                    <input type="text" id="full_name" class="form-control" placeholder="Іван Іванов" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label for="age">Вік *</label>
                                    <input type="number" id="age" class="form-control" placeholder="25" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label for="phone">Телефон *</label>
                                    <input type="tel" id="phone" class="form-control" placeholder="+380..." required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                            ` : ''}
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="email">Email *</label>
                                <input type="email" id="email" class="form-control" placeholder="example@mail.com" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="password">Пароль *</label>
                                <input type="password" id="password" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
    
                            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
                                <i class="fas fa-sign-in-alt"></i> 
                                <span>${this.mode === 'login' ? 'Увійти' : 'Зареєструватися'}</span>
                            </button>
                        </form>
    
                        <div style="text-align: center; margin-top: 20px; font-size: 0.9rem;">
                            <a href="#" id="toggleAuthMode" style="color: rgb(103, 123, 230); text-decoration: none;">
                                ${this.mode === 'login' ? 'Немає аккаунту? Зареєструйтесь' : 'Вже є аккаунт? Увійдіть'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const form = document.getElementById('authForm');
        const toggleBtn = document.getElementById('toggleAuthMode');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.mode = this.mode === 'login' ? 'register' : 'login';
                // Перерендериваем компонент в основном контейнере
                App.renderCurrentPage(); 
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    email: form.email.value,
                    password: form.password.value
                };

                if (this.mode === 'register') {
                    formData.full_name = form.full_name.value;
                    formData.phone = form.phone.value;
                    formData.age = Number(form.age.value);
                }

                try {
                    let response;
                    if (this.mode === 'login') {
                        response = await api.auth.login(formData);
                        Toast.success('Вітаємо, ' + response.user.full_name);
                    } else {
                        await api.auth.register(formData);
                        Toast.success('Реєстрація успішна! Тепер увійдіть.');
                        this.mode = 'login';
                        App.renderCurrentPage();
                        return;
                    }

                    // Зберігаємо токен (якщо API його повертає)
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));

                    // Перенаправляємо на дашборд
                    window.location.hash = '#dashboard';
                } catch (error) {
                    Toast.error('Помилка: ' + error.message);
                }
            });
        }
    }
};