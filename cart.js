// cart.js - полная версия с синхронизацией между страницами

// Функция для получения корзины из localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Функция для сохранения корзины в localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Функция для добавления товара в корзину
function addToCart(title, price, img) {
    const cart = getCart();
    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title: title,
            price: parseInt(price),
            img: img,
            quantity: 1
        });
    }
    
    saveCart(cart);
    
    // Анимация кнопки
    const buttons = document.querySelectorAll(`.add-to-cart-btn[data-title="${title}"]`);
    buttons.forEach(btn => {
        btn.classList.add('added');
        btn.textContent = '✓ Добавлено';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.textContent = '🛒 В корзину';
        }, 1500);
    });
    
    showNotification(`✅ ${title} добавлен в корзину`);
}

// Функция для удаления товара из корзины
function removeFromCart(title) {
    let cart = getCart();
    cart = cart.filter(item => item.title !== title);
    saveCart(cart);
    
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Функция для изменения количества товара
function updateQuantity(title, newQuantity) {
    const cart = getCart();
    const item = cart.find(item => item.title === title);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(title);
        } else {
            item.quantity = newQuantity;
            saveCart(cart);
        }
    }
    
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Функция для очистки всей корзины
function clearCart() {
    if (confirm('🗑️ Вы уверены, что хотите очистить всю корзину?')) {
        saveCart([]);
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
        showNotification('🗑️ Корзина очищена');
    }
}

// Функция для обновления счётчика на всех страницах
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cartCountFixed, .cart-count-fixed');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    localStorage.setItem('cartCount', totalItems);
}

// Немедленное обновление счётчика при загрузке скрипта
(function initCartCountOnLoad() {
    function updateCountFromStorage() {
        const savedCount = localStorage.getItem('cartCount');
        if (savedCount !== null) {
            const cartCountElements = document.querySelectorAll('#cartCountFixed, .cart-count-fixed');
            cartCountElements.forEach(element => {
                element.textContent = savedCount;
            });
        } else {
            const cart = getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountElements = document.querySelectorAll('#cartCountFixed, .cart-count-fixed');
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
            });
            localStorage.setItem('cartCount', totalItems);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCountFromStorage);
    } else {
        updateCountFromStorage();
    }
})();

// Функция для отображения уведомления
function showNotification(message) {
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Функция для отображения корзины на странице cart.html
function renderCart() {
    const cart = getCart();
    const cartContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCartDiv = document.getElementById('emptyCart');
    const cartSummaryBlock = document.getElementById('cartSummaryBlock');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        if (cartContainer) cartContainer.style.display = 'none';
        if (cartSummaryBlock) cartSummaryBlock.style.display = 'none';
        if (emptyCartDiv) emptyCartDiv.style.display = 'block';
        if (cartSummary) cartSummary.textContent = '0 товаров';
        return;
    }
    
    if (cartContainer) cartContainer.style.display = 'block';
    if (cartSummaryBlock) cartSummaryBlock.style.display = 'block';
    if (emptyCartDiv) emptyCartDiv.style.display = 'none';
    
    let total = 0;
    let totalItems = 0;
    cartContainer.innerHTML = '';
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img class="cart-item-img" src="${item.img}" alt="${item.title}" onerror="this.src='img/gift.png'">
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(item.title)}</div>
                <div class="cart-item-price">${item.price} ₽ × ${item.quantity} = ${itemTotal} ₽</div>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-item-decrease" data-title="${escapeHtml(item.title)}">-</button>
                <span>${item.quantity}</span>
                <button class="cart-item-increase" data-title="${escapeHtml(item.title)}">+</button>
            </div>
            <button class="cart-item-remove" data-title="${escapeHtml(item.title)}">🗑️</button>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    if (cartTotal) {
        cartTotal.textContent = `${total} ₽`;
    }
    if (cartSummary) {
        cartSummary.textContent = `${totalItems} товар(ов) на сумму ${total} ₽`;
    }
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = btn.dataset.title;
            removeFromCart(title);
        });
    });
    
    document.querySelectorAll('.cart-item-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = btn.dataset.title;
            const cart = getCart();
            const item = cart.find(i => i.title === title);
            if (item) {
                updateQuantity(title, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.cart-item-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = btn.dataset.title;
            const cart = getCart();
            const item = cart.find(i => i.title === title);
            if (item) {
                updateQuantity(title, item.quantity + 1);
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyCartToClipboard() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Корзина пуста');
        return;
    }
    
    let message = '🛒 *Мой заказ в AlterShop:*\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `📦 ${item.title} × ${item.quantity} = ${itemTotal} ₽\n`;
    });
    
    message += `\n💰 *Итого: ${total} ₽*`;
    message += `\n\n🚀 Для оформления заказа: @sfchkk03`;
    
    navigator.clipboard.writeText(message).then(() => {
        showNotification('✅ Состав корзины скопирован!');
    }).catch(() => {
        showNotification('❌ Не удалось скопировать');
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const title = this.dataset.title;
            const price = this.dataset.price;
            const img = this.dataset.img;
            addToCart(title, price, img);
        });
    });
    
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
        
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
        
        const copyCartBtn = document.getElementById('copyCartBtn');
        if (copyCartBtn) {
            copyCartBtn.addEventListener('click', copyCartToClipboard);
        }
    }
});

window.addEventListener('storage', function(e) {
    if (e.key === 'cart' || e.key === 'cartCount') {
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);