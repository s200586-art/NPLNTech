document.addEventListener('DOMContentLoaded', () => {
    let allStores = [];
    const storesGrid = document.getElementById('stores-grid');
    const storeCount = document.getElementById('store-count').querySelector('span');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Fetch stores data
    fetch('data/stores.json')
        .then(response => response.json())
        .then(data => {
            allStores = data.stores;
            renderStores(allStores);
        })
        .catch(error => {
            console.error('Error loading stores:', error);
            storesGrid.innerHTML = '<p class="error">Ошибка загрузки данных. Пожалуйста, попробуйте позже.</p>';
        });

    // Render stores
    function renderStores(stores) {
        storesGrid.innerHTML = '';
        storeCount.textContent = stores.length;

        stores.forEach(store => {
            const card = document.createElement('div');
            card.className = 'store-card';
            card.setAttribute('data-category', store.category);
            card.style.cursor = 'pointer';

            // Placeholder image if not found
            // Check if image is a full URL or local file
            const imagePath = store.image
                ? (store.image.startsWith('http') ? store.image : `images/${store.image}`)
                : `https://via.placeholder.com/800x600/FAF8F5/1A1A1A?text=${encodeURIComponent(store.name)}`;

            card.innerHTML = `
                <img src="${imagePath}" alt="${store.name}" class="store-image" onerror="this.src='https://via.placeholder.com/800x600/FAF8F5/1A1A1A?text=${encodeURIComponent(store.name)}'">
                <div class="store-info">
                    <span class="store-category">${getCategoryLabel(store.category)}</span>
                    <h3 class="store-name">${store.name}</h3>
                    <p class="store-location">${store.locationRu || store.location}</p>
                    <p class="store-description">${store.descriptionRu || store.description}</p>
                    <div class="store-footer">
                        <a href="${store.website}" target="_blank" class="store-link" rel="noopener" onclick="event.stopPropagation()">
                            Сайт <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                        </a>
                        ${store.googleMaps ? `
                        <a href="${store.googleMaps}" target="_blank" class="store-link" rel="noopener" onclick="event.stopPropagation()">
                            Карта <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </a>` : ''}
                    </div>
                </div>
            `;

            // Add click handler to navigate to detail page
            card.addEventListener('click', () => {
                window.location.href = `store-detail.html?id=${store.id}`;
            });

            storesGrid.appendChild(card);
        });
    }

    function getCategoryLabel(category) {
        const labels = {
            'flagship': 'Флагман',
            'innovation': 'Инновации',
            'unique': 'Уникальный подход',
            'specialist': 'Специализированный'
        };
        return labels[category] || category;
    }

    // Filter logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            if (filter === 'all') {
                renderStores(allStores);
            } else {
                const filtered = allStores.filter(s => s.category === filter);
                renderStores(filtered);
            }

            // Scroll to grid
            window.scrollTo({
                top: document.getElementById('stores').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
