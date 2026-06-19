(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }
  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        restart();
      });
    });
    restart();
  }
  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
    var section = scope.closest("section") || document;
    var input = section.querySelector("[data-filter-input]");
    var category = section.querySelector("[data-filter-category]");
    var year = section.querySelector("[data-filter-year]");
    var type = section.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var categoryValue = category ? category.value : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var keep = (!keyword || text.indexOf(keyword) !== -1) && (!categoryValue || card.getAttribute("data-category") === categoryValue) && (!yearValue || card.getAttribute("data-year") === yearValue) && (!typeValue || card.getAttribute("data-type") === typeValue);
        card.classList.toggle("is-filtered", !keep);
      });
    }
    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
      apply();
    }
  });
})();
