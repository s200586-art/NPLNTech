document.addEventListener('DOMContentLoaded', () => {
    // Get store ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('id');

    if (!storeId) {
        window.location.href = 'index.html';
        return;
    }

    // Fetch store data
    fetch('data/stores.json')
        .then(response => response.json())
        .then(data => {
            const store = data.stores.find(s => s.id === parseInt(storeId));
            if (!store) {
                window.location.href = 'index.html';
                return;
            }
            renderStoreDetail(store);
        })
        .catch(error => {
            console.error('Error loading store data:', error);
            alert('Ошибка загрузки данных магазина');
            window.location.href = 'index.html';
        });

    function renderStoreDetail(store) {
        // Update page title
        document.title = `${store.name} | 50 лучших магазинов напольных покрытий мира`;

        // Category badge
        const categoryBadge = document.getElementById('category-badge');
        categoryBadge.textContent = getCategoryLabel(store.category);

        // Store title and location
        const storeTitle = document.getElementById('store-title');
        storeTitle.textContent = store.name;

        const locationHero = document.getElementById('location-hero');
        locationHero.textContent = store.locationRu || store.location;

        // Main image
        const mainImage = document.getElementById('main-image');
        // Check if image is a full URL or local file
        const imagePath = store.image
            ? (store.image.startsWith('http') ? store.image : `images/${store.image}`)
            : `https://via.placeholder.com/1200x800/FAF8F5/1A1A1A?text=${encodeURIComponent(store.name)}`;
        mainImage.src = imagePath;
        mainImage.alt = store.name;
        mainImage.onerror = function() {
            this.src = `https://via.placeholder.com/1200x800/FAF8F5/1A1A1A?text=${encodeURIComponent(store.name)}`;
        };

        // Full location
        const fullLocation = document.getElementById('full-location');
        fullLocation.textContent = store.locationRu || store.location;

        // Website link
        const websiteLink = document.getElementById('website-link');
        const websiteLinkSidebar = document.getElementById('website-link-sidebar');
        if (store.website) {
            const websiteText = store.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
            websiteLink.href = store.website;
            websiteLink.textContent = websiteText;
            websiteLinkSidebar.href = store.website;
        }

        // Description
        const description = document.getElementById('description');
        description.innerHTML = store.descriptionRu || store.description;

        // History
        if (store.history) {
            const historySection = document.getElementById('history-section');
            const historyContent = document.getElementById('history');
            historyContent.innerHTML = store.historyRu || store.history;
            historySection.style.display = 'block';
        } else {
            document.getElementById('history-section').style.display = 'none';
        }

        // News
        if (store.news && store.news.length > 0) {
            const newsSection = document.getElementById('news-section');
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '';

            store.news.forEach(newsItem => {
                const newsElement = document.createElement('div');
                newsElement.className = 'news-item';
                newsElement.innerHTML = `
                    <div class="news-date">${newsItem.date}</div>
                    <h3 class="news-title">${newsItem.titleRu || newsItem.title}</h3>
                    <p class="news-text">${newsItem.textRu || newsItem.text}</p>
                `;
                newsList.appendChild(newsElement);
            });
            newsSection.style.display = 'block';
        } else {
            document.getElementById('news-section').style.display = 'none';
        }

        // Gallery
        if (store.gallery && store.gallery.length > 0) {
            const galleryGrid = document.getElementById('gallery-grid');
            galleryGrid.innerHTML = '';

            store.gallery.forEach((imageName, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                const img = document.createElement('img');
                img.src = `images/gallery/${imageName}`;
                img.alt = `${store.name} - фото ${index + 1}`;
                img.onerror = function() {
                    this.src = `https://via.placeholder.com/400x300/FAF8F5/1A1A1A?text=Фото+${index + 1}`;
                };

                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);
            });
        } else {
            document.getElementById('gallery').style.display = 'none';
        }

        // Google Maps link
        const mapsLink = document.getElementById('maps-link');
        if (store.googleMaps) {
            mapsLink.href = store.googleMaps;
            mapsLink.style.display = 'flex';
        } else {
            mapsLink.style.display = 'none';
        }
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
});
