// cart.js - версия с выбором пола только для определенных категорий

// КАТЕГОРИИ, ГДЕ НЕ НУЖЕН ВЫБОР ПОЛА
const NO_GENDER_CATEGORIES = [
    'Интерактивы',
    'Фоны',
    'Титулы',
    'Разное',
    'Фоны/Рамки',
    'Транспорт/Развлечения'
];

// Функция для проверки, нужен ли выбор пола для товара
function needsGenderSelection(title) {
    // Проверяем по названию страницы (можно передавать из URL или из атрибута)
    // Второй вариант: добавить data-атрибут в карточку
    
    // Проверяем по URL страницы, с которой добавлен товар
    const referrer = document.referrer;
    
    for (const category of NO_GENDER_CATEGORIES) {
        if (referrer.includes(category) || document.referrer.includes(encodeURIComponent(category))) {
            return false;
        }
    }
    
    // Можно также проверять по названию товара (если есть ключевые слова)
    const noGenderKeywords = ['фон', 'титул', 'интерактив', 'транспорт', 'рамка'];
    for (const keyword of noGenderKeywords) {
        if (title.toLowerCase().includes(keyword)) {
            return false;
        }
    }
    
    return true;
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

// Функция для добавления товара в корзину (с определением категории)
function addToCart(title, price, img, category) {
    const cart = getCart();
    const existingItem = cart.find(item => item.title === title);
    
    // Определяем, нужен ли выбор пола для этого товара
    const needsGender = category ? !NO_GENDER_CATEGORIES.includes(category) : needsGenderSelection(title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title: title,
            price: parseInt(price),
            img: img,
            category: category || 'Другое',
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
function updateGender(title, newGender) {
    const cart = getCart();
    const item = cart.find(item => item.title === title);
    
    if (item && item.needsGender) {
        item.gender = newGender;
        saveCart(cart);
        renderCart();
        showNotification(`👤 Пол для "${title}" изменен на ${newGender}`);
    }
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

// Функция для определения категории по URL страницы
function getCurrentCategory() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '');
    
    const categoryMap = {
        'ОбликЖ': 'Облики',
        'ОбликМ': 'Облики',
        'ОдеждаЖ': 'Одежда',
        'ОдеждаМ': 'Одежда',
        'Крылья': 'Крылья',
        'Аксессуары': 'Аксессуары',
        'ШоуИнт': 'Интерактивы',
        'ШоуФон': 'Фоны',
        'Титулы': 'Титулы',
        'Разное': 'Разное',
        'ФоныРамки': 'Фоны/Рамки',
        'ТранспортРазвлечения': 'Транспорт/Развлечения'
    };
    
    return categoryMap[pageName] || 'Другое';
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
        
        // Формируем HTML в зависимости от того, нужен ли выбор пола
        let genderHtml = '';
        if (item.needsGender) {
            genderHtml = `
                <div class="cart-item-gender-select">
                    <label class="gender-option-cart">
                        <input type="radio" name="gender_${escapeHtml(item.title)}" value="Муж." ${item.gender === 'Муж.' ? 'checked' : ''}>
                        <span>👨 Муж.</span>
                    </label>
                    <label class="gender-option-cart">
                        <input type="radio" name="gender_${escapeHtml(item.title)}" value="Жен." ${item.gender === 'Жен.' ? 'checked' : ''}>
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
    
    // Добавляем обработчики событий для кнопок в корзине
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
    
    // Добавляем обработчики для выбора пола (только для товаров, где это нужно)
    document.querySelectorAll('.gender-option-cart input').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Находим заголовок товара (родительский элемент)
            const cartItem = e.target.closest('.cart-item');
            const titleElement = cartItem.querySelector('.cart-item-title');
            if (titleElement) {
                const title = titleElement.textContent;
                const newGender = e.target.value;
                updateGender(title, newGender);
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
    updateCartCount();
    
    // Определяем текущую категорию для добавления товаров
    const currentCategory = getCurrentCategory();
    
    // Добавляем обработчики для всех кнопок "В корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const title = this.dataset.title;
            const price = this.dataset.price;
            const img = this.dataset.img;
            addToCart(title, price, img, currentCategory);
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