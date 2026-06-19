(function () {
  var doc = document;

  function ready(fn) {
    if (doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = doc.querySelector(".menu-toggle");
    if (menuButton) {
      menuButton.addEventListener("click", function () {
        var opened = doc.body.classList.toggle("menu-open");
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(doc.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(doc.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === currentSlide);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === currentSlide);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    var next = doc.querySelector("[data-hero-next]");
    var prev = doc.querySelector("[data-hero-prev]");
    if (next) {
      next.addEventListener("click", function () {
        showSlide(currentSlide + 1);
        startHero();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(currentSlide - 1);
        startHero();
      });
    }
    startHero();

    var cards = Array.prototype.slice.call(doc.querySelectorAll(".movie-card"));
    var inputs = Array.prototype.slice.call(doc.querySelectorAll(".movie-search-input"));
    var yearSelects = Array.prototype.slice.call(doc.querySelectorAll(".year-filter"));

    function activeQuery() {
      var found = "";
      inputs.forEach(function (input) {
        if (input.value.trim()) {
          found = input.value.trim();
        }
      });
      return normalize(found);
    }

    function activeYear() {
      var year = "";
      yearSelects.forEach(function (select) {
        if (select.value) {
          year = select.value;
        }
      });
      return year;
    }

    function filterCards() {
      var query = activeQuery();
      var year = activeYear();
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("hidden-by-filter", !(matchQuery && matchYear));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        filterCards();
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          input.value = "";
          filterCards();
        }
      });
    });

    yearSelects.forEach(function (select) {
      select.addEventListener("change", function () {
        yearSelects.forEach(function (other) {
          if (other !== select) {
            other.value = select.value;
          }
        });
        filterCards();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      inputs.forEach(function (input) {
        input.value = q;
      });
      filterCards();
      var list = doc.getElementById("movie-list");
      if (list) {
        list.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    Array.prototype.slice.call(doc.querySelectorAll("form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector(".movie-search-input");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        var hasLocalCards = cards.length > 0 && doc.getElementById("movie-list");
        if (hasLocalCards) {
          event.preventDefault();
          inputs.forEach(function (other) {
            other.value = value;
          });
          filterCards();
          doc.getElementById("movie-list").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    Array.prototype.slice.call(doc.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-player-cover]");
      var button = player.querySelector("[data-play-button]");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var instance = null;

      function attach() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          instance.loadSource(stream);
          instance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  });
})();
