(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.poster img, .hero-poster-card img, .detail-poster img').forEach(function (image) {
    image.addEventListener('error', function () {
      var poster = image.closest('.poster');
      if (poster) {
        poster.classList.add('is-missing');
      }
      image.style.opacity = '0';
    });
  });

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterInput = document.querySelector('[data-card-filter]');
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filterCount = document.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    function applyFilter() {
      var query = filterInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-search') || '')).toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = visible + ' 部影片可见';
      }
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }
})();
