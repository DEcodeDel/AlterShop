// search.js - обновленная версия с фильтром бонусов
document.addEventListener('DOMContentLoaded', function() {
    // Находим элементы
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('searchClear');
    const bonusFilter = document.getElementById('bonusFilter');
    
    // Проверяем, есть ли элементы
    if (!searchInput) return;
    
    // Находим все карточки
    const cards = document.querySelectorAll('.col');
    
    // Функция для проверки, является ли товар бонусным
    function isBonusCard(card) {
        // Ищем иконку подарка в новой структуре (.gift-icon) и в старой (.card-box) для обратной совместимости
        const giftIcon = card.querySelector('.gift-icon img, .card-box img[src*="gift"]');
        
        // Проверяем, есть ли надпись "Бонус" в названии или тексте
        const title = card.querySelector('.card-title');
        const titleText = title ? title.textContent.toLowerCase() : '';
        
        // Товар считается бонусным, если:
        // 1. У него есть иконка подарка, ИЛИ
        // 2. В названии есть слово "бонус"
        return giftIcon !== null || titleText.includes('бонус');
    }
    
    // Функция фильтрации
    function filterCards() {
        const searchText = searchInput.value.toLowerCase().trim();
        const showOnlyBonuses = bonusFilter ? bonusFilter.checked : false;
        
        let visibleCount = 0;
        
        cards.forEach(card => {
            // Находим заголовок карточки
            const titleElement = card.querySelector('.card-title');
            if (!titleElement) return;
            
            const title = titleElement.textContent.toLowerCase();
            
            // Проверяем условия
            let matchesSearch = searchText === '' || title.includes(searchText);
            let matchesBonus = !showOnlyBonuses || isBonusCard(card);
            
            if (matchesSearch && matchesBonus) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем/скрываем кнопку очистки
        if (clearButton) {
            clearButton.style.display = searchText ? 'block' : 'none';
        }
        
        // Показываем сообщение, если ничего не найдено
        const existingMessage = document.querySelector('.no-results');
        
        if (visibleCount === 0) {
            let messageText = '';
            if (searchText !== '' && showOnlyBonuses) {
                messageText = `🔍 По запросу "${searchText}" нет бонусных товаров`;
            } else if (searchText !== '') {
                messageText = `🔍 По запросу "${searchText}" ничего не найдено`;
            } else if (showOnlyBonuses) {
                messageText = `🎁 Бонусные товары отсутствуют`;
            }
            
            if (messageText) {
                if (!existingMessage) {
                    const message = document.createElement('div');
                    message.className = 'no-results';
                    message.innerHTML = messageText;
                    const contentDiv = document.querySelector('.content');
                    if (contentDiv) {
                        contentDiv.appendChild(message);
                    }
                } else {
                    existingMessage.innerHTML = messageText;
                    existingMessage.style.display = 'block';
                }
            } else if (existingMessage) {
                existingMessage.style.display = 'none';
            }
        } else {
            if (existingMessage) {
                existingMessage.style.display = 'none';
            }
        }
        
        console.log(`Найдено товаров: ${visibleCount} (поиск: "${searchText}", только бонусы: ${showOnlyBonuses})`);
    }
    
    // Добавляем обработчики событий
    searchInput.addEventListener('input', filterCards);
    if (bonusFilter) {
        bonusFilter.addEventListener('change', filterCards);
    }
    
    // Очистка поиска
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            filterCards();
            searchInput.focus();
        });
    }
    
    // Запускаем фильтрацию при загрузке
    filterCards();
});