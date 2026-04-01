// cart.js - Корзина для AlterShop

// Функция добавления в корзину
function addToCart(title, price, img) {
    let cart = JSON.parse(localStorage.getItem('alterCart') || '[]');
    cart.push({ title: title, price: parseInt(price), img: img || 'img/gift.png' });
    localStorage.setItem('alterCart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`"${title}" добавлен в корзину`);
    console.log('Товар добавлен, в корзине:', cart.length, 'товаров');
    return true;
}

// Обновление счетчика на всех страницах
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('alterCart') || '[]');
    const count = cart.length;
    
    // Обновляем счетчик в фиксированной корзине (справа вверху)
    const fixedCount = document.getElementById('cartCountFixed');
    if (fixedCount) {
        fixedCount.textContent = count;
        if (count === 0) {
            fixedCount.style.opacity = '0.7';
        } else {
            fixedCount.style.opacity = '1';
        }
    }
    
    // Обновляем счетчик в шапке (если есть)
    const headerCount = document.getElementById('cartCount');
    if (headerCount) {
        headerCount.textContent = count;
    }
    
    console.log('Счётчик обновлён:', count);
}

// Уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; background: #ff70ae;
        color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999;
        animation: slideIn 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('cart.js загружен');
    updateCartCount();
    
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    console.log('Найдено кнопок "В корзину":', buttons.length);
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const title = this.dataset.title;
            const price = this.dataset.price;
            const img = this.dataset.img;
            
            console.log('Добавляем:', title, price);
            
            if (!title || !price) {
                alert('Ошибка: данные товара не найдены');
                return;
            }
            
            addToCart(title, price, img);
            
            const originalText = this.innerHTML;
            this.innerHTML = '✓ Добавлено!';
            this.style.background = '#4caf50';
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 1500);
        });
    });
});

// Стили
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .add-to-cart-btn {
        background: linear-gradient(135deg, #ff70ae, #ff529d);
        color: white; border: none; padding: 8px 15px; border-radius: 25px;
        cursor: pointer; margin-top: 10px; transition: all 0.3s ease;
        font-size: 14px; width: 100%;
    }
    .add-to-cart-btn:hover {
        background: linear-gradient(135deg, #ff529d, #ff3b6f);
        transform: translateY(-2px);
    }
    .fixed-cart {
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: linear-gradient(135deg, #ff70ae, #ff529d);
        color: white; text-decoration: none; padding: 12px 18px;
        border-radius: 50px; font-size: 20px; box-shadow: 0 4px 15px rgba(255,82,157,0.4);
        transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;
    }
    .fixed-cart:hover { transform: scale(1.05); color: white; }
    .cart-count-fixed {
        background: white; color: #ff529d; border-radius: 50%;
        padding: 2px 8px; font-size: 14px; font-weight: bold;
    }
    @media (max-width: 768px) {
        .fixed-cart { top: 10px; right: 10px; padding: 8px 14px; font-size: 16px; }
        .cart-count-fixed { font-size: 12px; padding: 2px 6px; }
    }
`;
document.head.appendChild(style);