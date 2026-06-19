(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        const showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    const cardList = document.querySelector('[data-card-list]');

    if (filterPanel && cardList) {
        const searchInput = filterPanel.querySelector('[data-card-search]');
        const yearFilter = filterPanel.querySelector('[data-year-filter]');
        const typeFilter = filterPanel.querySelector('[data-type-filter]');
        const resetButton = filterPanel.querySelector('[data-filter-reset]');
        const emptyState = document.querySelector('[data-empty-state]');
        const cards = Array.from(cardList.children);

        const normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        const applyFilters = function () {
            const keyword = normalize(searchInput && searchInput.value);
            const year = normalize(yearFilter && yearFilter.value);
            const type = normalize(typeFilter && typeFilter.value);
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const matchesKeyword = !keyword || haystack.includes(keyword);
                const matchesYear = !year || normalize(card.dataset.year) === year;
                const matchesType = !type || normalize(card.dataset.type) === type;
                const visible = matchesKeyword && matchesYear && matchesType;

                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        };

        [searchInput, yearFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                if (typeFilter) {
                    typeFilter.value = '';
                }
                applyFilters();
            });
        }
    }
})();
