// search.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Поиск загружен');
    
    // Находим элементы поиска
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('searchClear');
    
    // Проверяем, есть ли поисковое поле на странице
    if (!searchInput) {
        console.log('Поисковое поле не найдено');
        return;
    }
    
    // Находим все карточки
    const cards = document.querySelectorAll('.col');
    console.log('Найдено карточек:', cards.length);
    
    // Функция фильтрации карточек
    function filterCards() {
        const searchText = searchInput.value.toLowerCase().trim();
        console.log('Поисковый запрос:', searchText);
        
        let visibleCount = 0;
        
        // Перебираем все карточки
        cards.forEach(card => {
            // Ищем заголовок карточки
            const titleElement = card.querySelector('.card-title');
            
            if (!titleElement) {
                console.log('Карточка без заголовка');
                return;
            }
            
            const title = titleElement.textContent.toLowerCase();
            
            // Проверяем, содержит ли название поисковый запрос
            if (searchText === '' || title.includes(searchText)) {
                card.style.display = ''; // Показываем карточку
                visibleCount++;
            } else {
                card.style.display = 'none'; // Скрываем карточку
            }
        });
        
        console.log('Видимых карточек:', visibleCount);
        
        // Показываем/скрываем кнопку очистки
        if (clearButton) {
            clearButton.style.display = searchText ? 'block' : 'none';
        }
        
        // Показываем сообщение, если ничего не найдено
        const existingMessage = document.querySelector('.no-results');
        
        if (visibleCount === 0 && searchText !== '') {
            if (!existingMessage) {
                const message = document.createElement('div');
                message.className = 'no-results';
                message.innerHTML = `🔍 По запросу "${searchText}" ничего не найдено`;
                const contentDiv = document.querySelector('.content');
                if (contentDiv) {
                    contentDiv.appendChild(message);
                }
            } else {
                existingMessage.innerHTML = `🔍 По запросу "${searchText}" ничего не найдено`;
                existingMessage.style.display = 'block';
            }
        } else {
            if (existingMessage) {
                existingMessage.style.display = 'none';
            }
        }
    }
    
    // Добавляем обработчик события на ввод текста
    searchInput.addEventListener('input', filterCards);
    
    // Обработчик для кнопки очистки
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            filterCards();
            searchInput.focus();
        });
    }
    
    // Запускаем фильтрацию при загрузке (на случай, если поле не пустое)
    filterCards();
});