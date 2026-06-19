(function () {
    const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
    const params = new URLSearchParams(window.location.search);
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const summary = document.querySelector('[data-search-summary]');
    const form = document.querySelector('[data-search-page-form]');

    const escapeHtml = function (value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    const cardTemplate = function (movie) {
        return `
                <article class="movie-card">
                    <a class="movie-poster" href="./${escapeHtml(movie.file)}" aria-label="观看 ${escapeHtml(movie.title)}">
                        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                        <span class="poster-shade"></span>
                        <span class="play-badge">▶</span>
                        <span class="year-badge">${escapeHtml(movie.year)}</span>
                    </a>
                    <div class="movie-card-body">
                        <h3 class="card-title"><a href="./${escapeHtml(movie.file)}">${escapeHtml(movie.title)}</a></h3>
                        <p class="card-meta">${escapeHtml(movie.type)} · ${escapeHtml(movie.genre)}</p>
                    </div>
                </article>`;
    };

    const runSearch = function (query) {
        const keyword = normalize(query);

        if (input) {
            input.value = query || '';
        }

        if (!keyword) {
            if (summary) {
                summary.textContent = '请输入关键词开始搜索。';
            }
            if (results) {
                results.innerHTML = '';
            }
            return;
        }

        const matched = movies.filter(function (movie) {
            const text = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                movie.tags
            ].join(' '));
            return text.includes(keyword);
        });

        if (summary) {
            summary.textContent = `关键词“${query}”共找到 ${matched.length} 部影片。`;
        }

        if (results) {
            results.innerHTML = matched.slice(0, 240).map(cardTemplate).join('');
        }
    };

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = input ? input.value.trim() : '';
            const url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
            runSearch(query);
        });
    }

    runSearch(params.get('q') || '');
})();
