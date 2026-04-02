// cart.js - исправленная версия

// КАТЕГОРИИ, ГДЕ НУЖЕН ВЫБОР ПОЛА
const GENDER_CATEGORIES = [ 
    'ОдеждаЖ',
    'ОдеждаМ',
    'Парики',
    'Детское',
    'Аксессуары'
];

// Функция для декодирования URL-кодировки (например, %D0%9A -> К)
function decodeCategory(str) {
    try {
        return decodeURIComponent(str);
    } catch(e) {
        return str;
    }
}

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

// Функция для определения категории по URL страницы
function getCurrentCategory() {
    const path = window.location.pathname;
    let pageName = path.split('/').pop().replace('.html', '');
    // Декодируем название страницы (на случай если есть закодированные символы)
    pageName = decodeCategory(pageName);
    return pageName;
}

// Функция для проверки, нужен ли выбор пола для данной страницы/категории
function needsGenderSelection(category) {
    return GENDER_CATEGORIES.includes(category);
}

// Функция для добавления товара в корзину
function addToCart(title, price, img) {
    const cart = getCart();
    const currentCategory = getCurrentCategory();
    const needsGender = needsGenderSelection(currentCategory);
    
    // Создаем уникальный ID для товара (используем чистые названия без кодировки)
    const cleanCategory = decodeCategory(currentCategory);
    const itemId = `${title}_${cleanCategory}`;
    
    // Ищем существующий товар
    let existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: itemId,
            title: title,
            price: parseInt(price),
            img: img,
            category: cleanCategory,
            needsGender: needsGender,
            gender: needsGender ? 'Не выбран' : null,
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

// Функция для изменения пола товара в корзине
function updateGender(itemId, newGender) {
    const cart = getCart();
    const item = cart.find(item => item.id === itemId);
    
    if (item && item.needsGender) {
        item.gender = newGender;
        saveCart(cart);
        renderCart();
        showNotification(`👤 Пол для "${item.title}" изменен на ${newGender}`);
    }
}

// Функция для удаления товара из корзины
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Функция для изменения количества товара
function updateQuantity(itemId, newQuantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
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

// Функция для исправления старых товаров в корзине (добавляет поле needsGender)
function fixOldCartItems() {
    let cart = getCart();
    let changed = false;
    
    cart = cart.map(item => {
        // Если у товара нет поля needsGender, определяем его по категории
        if (item.needsGender === undefined) {
            // Декодируем категорию, если она закодирована
            const cleanCategory = item.category ? decodeCategory(item.category) : '';
            item.needsGender = GENDER_CATEGORIES.includes(cleanCategory);
            item.category = cleanCategory;
            if (item.needsGender && !item.gender) {
                item.gender = 'Не выбран';
            }
            changed = true;
        }
        return item;
    });
    
    if (changed) {
        saveCart(cart);
        console.log('✅ Старые товары в корзине исправлены');
    }
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
        cartItem.dataset.id = item.id;
        
        // Формируем HTML в зависимости от того, нужен ли выбор пола
        let genderHtml = '';
        if (item.needsGender === true) {
            genderHtml = `
                <div class="cart-item-gender-select">
                    <label class="gender-option-cart">
                        <input type="radio" name="gender_${item.id}" value="Муж." ${item.gender === 'Муж.' ? 'checked' : ''}>
                        <span>👨 Муж.</span>
                    </label>
                    <label class="gender-option-cart">
                        <input type="radio" name="gender_${item.id}" value="Жен." ${item.gender === 'Жен.' ? 'checked' : ''}>
                        <span>👩 Жен.</span>
                    </label>
                </div>
            `;
        }
        
        cartItem.innerHTML = `
            <img class="cart-item-img" src="${item.img}" alt="${item.title}" onerror="this.src='img/gift.png'">
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(item.title)}</div>
                ${genderHtml}
                <div class="cart-item-price">${item.price} ₽ × ${item.quantity} = ${itemTotal} ₽</div>
            </div>
            <div class="cart-item-quantity">
                <button class="cart-item-decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="cart-item-increase" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">🗑️</button>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    if (cartTotal) {
        cartTotal.textContent = `${total} ₽`;
    }
    if (cartSummary) {
        cartSummary.textContent = `${totalItems} товар(ов) на сумму ${total} ₽`;
    }
    
    // Добавляем обработчики событий для кнопок в корзине
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            removeFromCart(id);
        });
    });
    
    document.querySelectorAll('.cart-item-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const cart = getCart();
            const item = cart.find(i => i.id === id);
            if (item) {
                updateQuantity(id, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.cart-item-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const cart = getCart();
            const item = cart.find(i => i.id === id);
            if (item) {
                updateQuantity(id, item.quantity + 1);
            }
        });
    });
    
    // Добавляем обработчики для выбора пола
    document.querySelectorAll('.gender-option-cart input').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const name = e.target.name;
            const itemId = name.replace('gender_', '');
            const newGender = e.target.value;
            updateGender(itemId, newGender);
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
        let genderDisplay = '';
        if (item.needsGender && item.gender && item.gender !== 'Не выбран') {
            genderDisplay = ` (${item.gender})`;
        }
        message += `📦 ${item.title}${genderDisplay} × ${item.quantity} = ${itemTotal} ₽\n`;
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
    // Сначала исправляем старые товары в корзине
    fixOldCartItems();
    
    updateCartCount();
    
    // Добавляем обработчики для всех кнопок "В корзину"
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
    
    // Если мы на странице корзины, рендерим её
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