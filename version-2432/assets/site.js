(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var minis = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-mini]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
      minis.forEach(function (mini, miniIndex) {
        mini.classList.toggle("active", miniIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    minis.forEach(function (mini) {
      mini.addEventListener("mouseenter", function () {
        activate(Number(mini.getAttribute("data-hero-mini")) || 0);
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (section) {
      var video = section.querySelector("video");
      var button = section.querySelector("[data-player-button]");
      var source = section.getAttribute("data-source");
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "true") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "true");
      }

      function playVideo() {
        attachSource();
        section.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      video.addEventListener("click", function () {
        attachSource();
      });

      video.addEventListener("play", function () {
        section.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          section.classList.add("is-playing");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function makeResultCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearch() {
    var data = window.__MOVIES__ || [];
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var status = document.querySelector("[data-search-status]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !input || !status || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        status.textContent = "输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }
      var matched = data.filter(function (movie) {
        return movie.searchText.indexOf(keyword) !== -1;
      }).slice(0, 120);
      status.textContent = matched.length ? "找到相关影片：" + matched.length + " 部" : "没有找到相关影片。";
      results.innerHTML = matched.map(makeResultCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
      window.history.replaceState(null, "", nextUrl);
      render(query);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupPlayers();
    setupSearch();
  });
})();
