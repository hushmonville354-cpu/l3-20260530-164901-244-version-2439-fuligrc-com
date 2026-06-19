(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 42) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
      document.body.classList.toggle('no-scroll', header.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startAuto() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAuto();
      });
    });

    showSlide(0);
    startAuto();
  }

  var grid = document.querySelector('[data-card-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var term = normalize(searchInput ? searchInput.value : '');
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var visible = !term || haystack.indexOf(term) !== -1;
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && normalize(card.dataset[key]) !== filters[key]) {
            visible = false;
          }
        });
        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });
    filterCards();
  }
})();
