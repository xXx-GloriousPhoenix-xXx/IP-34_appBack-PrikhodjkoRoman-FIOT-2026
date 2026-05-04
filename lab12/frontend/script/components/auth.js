const AuthComponent = {
    mode: 'login',

    async render() {
        return `
            <div class="auth-screen" style="display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 80px); width: 100%;">
                <div class="auth-container" style="width: 100%; max-width: 400px; padding: 20px;">
                    <div class="card">
                        <div class="card-header" style="text-align: center; margin-bottom: 20px;">
                            <h2>${this.mode === 'login' ? 'Вхід в систему' : 'Реєстрація'}</h2>
                            <p style="color: #718096;">${this.mode === 'login' ? 'Введіть свої дані для доступу' : 'Створіть новий аккаунт'}</p>
                        </div>
                        
                        <form id="authForm">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="email">Email *</label>
                                <input type="email" name="email" id="email" class="form-control" placeholder="example@mail.com" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="password">Пароль *</label>
                                <input type="password" name="password" id="password" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>

                            ${this.mode === 'register' ? `
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label for="confirm_password">Підтвердіть пароль *</label>
                                    <input type="password" name="confirm_password" id="confirm_password" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label for="full_name">Повне ім'я *</label>
                                    <input type="text" name="full_name" id="full_name" class="form-control" placeholder="Іван Іванов" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label for="age">Вік *</label>
                                    <input type="number" name="age" id="age" class="form-control" placeholder="18" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                                <div class="form-group" style="margin-bottom: 20px;">
                                    <label for="phone">Телефон *</label>
                                    <input type="tel" name="phone" id="phone" class="form-control" placeholder="+380..." required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                            ` : ''}
    
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
                App.renderCurrentPage(); 
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = form.email.value.trim();
                const password = form.password.value;

                if (this.mode === 'register') {
                    const confirmPassword = form.confirm_password.value;
                    const age = Number(form.age.value);

                    if (password !== confirmPassword) {
                        Toast.error('Паролі не співпадають!');
                        return;
                    }

                    // Валидация возраста
                    if (age < 1 || age > 120) {
                        Toast.error('Будь ласка, вкажіть коректний вік');
                        return;
                    }
                }

                const formData = { email, password };

                if (this.mode === 'register') {
                    formData.full_name = form.full_name.value.trim();
                    formData.phone = form.phone.value.trim();
                    formData.age = Number(form.age.value);
                }

                try {
                    if (this.mode === 'login') {
                        const response = await api.auth.login(formData);
                        const { token, user } = response.data; 

                        Toast.success('Вітаємо, ' + user.full_name);
                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.hash = '#dashboard';
                    } else {
                        await api.auth.register(formData);
                        Toast.success('Реєстрація успішна! Тепер увійдіть.');
                        this.mode = 'login';
                        App.renderCurrentPage();
                    }
                } catch (error) {
                    Toast.error(error.message || 'Сталася помилка при авторизації');
                }
            });
        }
    }
};