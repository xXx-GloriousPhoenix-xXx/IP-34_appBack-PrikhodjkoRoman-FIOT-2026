const AuthComponent = {
    mode: 'login',

    patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+380\d{9}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    },

    async render() {
        return `
            <div class="auth-screen" style="display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 80px); width: 100%;">
                <div class="auth-container" style="width: 100%; max-width: 400px; padding: 20px;">
                    <div class="card">
                        <div class="card-header" style="text-align: center; margin-bottom: 20px;">
                            <h2>${this.mode === 'login' ? 'Вхід в систему' : 'Реєстрація'}</h2>
                        </div>
                        
                        <form id="authForm" novalidate>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label>Email *</label>
                                <input type="email" name="email" id="email" class="form-control" placeholder="example@mail.com" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; transition: border 0.3s;">
                                <small class="error-msg" id="emailError" style="color: #e53e3e; display: none;">Невірний формат email</small>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label>Пароль *</label>
                                <input type="password" name="password" id="password" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; transition: border 0.3s;">
                                <small id="passwordError" style="color: #e53e3e; display: none; font-size: 0.8rem; line-height: 1.2;">
                                    Пароль має містити: мін. 8 символів, заглавну та малу літери, цифру та спецсимвол.
                                </small>
                            </div>

                            ${this.mode === 'register' ? `
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label>Підтвердіть пароль *</label>
                                    <input type="password" name="confirm_password" id="confirm_password" class="form-control" placeholder="••••••••" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                    <small class="error-msg" id="confirmError" style="color: #e53e3e; display: none;">Паролі не співпадають</small>
                                </div>
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label>Телефон *</label>
                                    <input type="tel" name="phone" id="phone" class="form-control" placeholder="+380XXXXXXXXX" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                    <small class="error-msg" id="phoneError" style="color: #e53e3e; display: none;">Формат: +380 и 9 цифр</small>
                                </div>
                                <div class="form-group" style="margin-bottom: 15px;">
                                    <label>Повне ім'я *</label>
                                    <input type="text" name="full_name" id="full_name" class="form-control" placeholder="Ім'я" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                                <div class="form-group" style="margin-bottom: 20px;">
                                    <label>Вік *</label>
                                    <input type="number" name="age" id="age" class="form-control" placeholder="18" required style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                </div>
                            ` : ''}
    
                            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%; padding: 12px;">
                                <span>${this.mode === 'login' ? 'Увійти' : 'Зареєструватися'}</span>
                            </button>
                        </form>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="#" id="toggleAuthMode" style="color: #677be6; text-decoration: none;">
                                ${this.mode === 'login' ? 'Немає аккаунту? Реєстрація' : 'Вже є аккаунт? Увійти'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    toggleValidation(input, isValid, errorId) {
        const errorEl = document.getElementById(errorId);
        if (isValid || input.value === '') {
            input.style.borderColor = '#e2e8f0';
            if (errorEl) errorEl.style.display = 'none';
            return true;
        } else {
            input.style.borderColor = '#e53e3e';
            if (errorEl) errorEl.style.display = 'block';
            return false;
        }
    },

    init() {
        const form = document.getElementById('authForm');
        if (!form) return;

        // --- LIVE CHECK ---
        form.email.addEventListener('input', () => {
            this.toggleValidation(form.email, this.patterns.email.test(form.email.value), 'emailError');
        });

        form.password.addEventListener('input', () => {
            this.toggleValidation(form.password, this.patterns.password.test(form.password.value), 'passwordError');
        });

        if (this.mode === 'register') {
            form.phone.addEventListener('input', () => {
                this.toggleValidation(form.phone, this.patterns.phone.test(form.phone.value), 'phoneError');
            });

            form.confirm_password.addEventListener('input', () => {
                const match = form.password.value === form.confirm_password.value;
                this.toggleValidation(form.confirm_password, match, 'confirmError');
            });
        }

        // --- SUBMIT ---
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Финальная проверка перед отправкой
            const isEmailValid = this.patterns.email.test(form.email.value);
            const isPassValid = this.patterns.password.test(form.password.value);
            
            if (!isEmailValid || !isPassValid) {
                Toast.error('Будь ласка, перевірте правильність заповнення полів');
                return;
            }

            if (this.mode === 'register' && form.password.value !== form.confirm_password.value) {
                Toast.error('Паролі не співпадають');
                return;
            }

            const formData = {
                email: form.email.value,
                password: form.password.value
            };

            if (this.mode === 'register') {
                Object.assign(formData, {
                    full_name: form.full_name.value,
                    phone: form.phone.value,
                    age: Number(form.age.value)
                });
            }

            try {
                const response = await (this.mode === 'login' ? api.auth.login(formData) : api.auth.register(formData));
                
                if (this.mode === 'login') {
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    Toast.success('Вітаємо, ' + user.full_name);
                    window.location.hash = '#dashboard';
                } else {
                    Toast.success('Реєстрація успішна!');
                    this.mode = 'login';
                    App.renderCurrentPage();
                }
            } catch (error) {
                Toast.error(error.message);
            }
        });

        document.getElementById('toggleAuthMode')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.mode = this.mode === 'login' ? 'register' : 'login';
            App.renderCurrentPage();
        });
    }
};