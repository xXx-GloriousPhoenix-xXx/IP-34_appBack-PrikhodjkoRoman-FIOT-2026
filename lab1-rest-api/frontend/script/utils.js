// Утиліти для роботи з датою
const DateUtils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    isOverdue(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return date < now;
    },

    getHoursDifference(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return (endDate - startDate) / (1000 * 60 * 60);
    }
};

// Утиліти для роботи зі статусами
const StatusUtils = {
    getStatusClass(status) {
        const statusMap = {
            'active': 'status-active',
            'pending': 'status-pending',
            'paid': 'status-active',
            'cancelled': 'status-cancelled',
            'expired': 'status-cancelled',
            'completed': 'status-active'
        };
        return statusMap[status] || 'status-pending';
    },

    getStatusText(status) {
        const statusMap = {
            'active': 'Активний',
            'pending': 'Очікує',
            'paid': 'Оплачено',
            'cancelled': 'Скасовано',
            'expired': 'Закінчився',
            'completed': 'Завершено',
            'desk': 'Стіл',
            'meeting_room': 'Переговорна'
        };
        return statusMap[status] || status;
    }
};

// Утиліти для роботи з грошима
const MoneyUtils = {
    format(amount) {
        return new Intl.NumberFormat('uk-UA', {
            style: 'currency',
            currency: 'UAH',
            minimumFractionDigits: 2
        }).format(amount);
    },

    calculateDiscount(hours, baseAmount) {
        if (hours > 4) {
            return {
                discountPercent: 10,
                discountAmount: baseAmount * 0.1,
                finalAmount: baseAmount * 0.9
            };
        }
        return {
            discountPercent: 0,
            discountAmount: 0,
            finalAmount: baseAmount
        };
    }
};

// Утиліти для валідації
const ValidationUtils = {
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^\+?[\d\s-]{10,}$/;
        return re.test(phone);
    },

    validateAge(age) {
        return age >= 16 && age <= 120;
    },

    validateTimeRange(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = new Date();
        
        if (startDate < now) {
            return 'Час початку не може бути в минулому';
        }
        
        if (endDate <= startDate) {
            return 'Час закінчення має бути пізніше часу початку';
        }
        
        const hours = DateUtils.getHoursDifference(start, end);
        if (hours < 0.5) {
            return 'Мінімальний час бронювання - 30 хвилин';
        }
        
        return null;
    }
};

// Toast сповіщення
const Toast = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// Модальне вікно
const Modal = {
    element: document.getElementById('modal'),
    title: document.getElementById('modalTitle'),
    body: document.getElementById('modalBody'),
    confirmBtn: document.getElementById('modalConfirm'),
    cancelBtn: document.getElementById('modalCancel'),
    closeBtn: document.querySelector('.modal-close'),

    init() {
        this.cancelBtn.addEventListener('click', () => this.hide());
        this.closeBtn.addEventListener('click', () => this.hide());
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.hide();
        });
    },

    show(title, content, onConfirm) {
        this.title.textContent = title;
        this.body.innerHTML = content;
        this.element.classList.add('active');
        
        this.confirmBtn.onclick = () => {
            if (onConfirm) onConfirm();
            this.hide();
        };
    },

    hide() {
        this.element.classList.remove('active');
    }
};

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
});