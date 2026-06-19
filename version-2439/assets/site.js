(function () {
  const HLS_SOURCE_FALLBACK = null;

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function initNavigation() {
    const button = qs("[data-nav-toggle]");
    const menu = qs("[data-nav-menu]");
    if (!button || !menu) return;

    button.addEventListener("click", () => {
      const hidden = menu.hasAttribute("hidden");
      if (hidden) {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initSearchPage() {
    const mount = qs("[data-search-results]");
    const input = qs("[data-search-input]");
    if (!mount || !input) return;

    let movies = [];

    function render(items, query) {
      if (!items.length) {
        mount.innerHTML = `
          <div class="empty-state">
            <h2>没有找到匹配结果</h2>
            <p>试试更短的关键词，或者切换到分类页面继续浏览。</p>
          </div>
        `;
        return;
      }

      mount.innerHTML = items.map((movie) => {
        const tags = movie.tags.slice(0, 4).map((tag) => `<span class="tag">#${tag}</span>`).join("");
        return `
          <a class="movie-card movie-card--search" href="${movie.url}">
            <div class="poster poster-small" style="--c1:${movie.c1};--c2:${movie.c2};--c3:${movie.c3};--glow:${movie.glow}">
              <div class="poster__overlay"></div>
              <div class="poster__content">
                <div class="poster__meta">
                  <span>${movie.region}</span>
                  <span>${movie.year}</span>
                </div>
                <h3>${movie.title}</h3>
              </div>
            </div>
            <div class="movie-card__body">
              <div class="movie-card__head">
                <h3>${movie.title}</h3>
                <span class="movie-card__type">${movie.type}</span>
              </div>
              <p>${movie.one_line}</p>
              <div class="movie-card__tags">${tags}</div>
            </div>
          </a>
        `;
      }).join("");
    }

    async function load() {
      const src = mount.getAttribute("data-index-src") || "./assets/movies-index.json";
      const res = await fetch(src);
      movies = await res.json();
      movies = movies.map((movie) => {
        const seed = String(movie.id) + movie.title;
        const hash = Array.from(seed).reduce((acc, ch) => {
          acc = (acc * 31 + ch.charCodeAt(0)) % 360000;
          return acc;
        }, 7);
        const hue = hash % 360;
        return {
          ...movie,
          c1: `hsl(${hue} 85% 58%)`,
          c2: `hsl(${(hue + 48) % 360} 80% 48%)`,
          c3: `hsl(${(hue + 175) % 360} 82% 35%)`,
          glow: `hsl(${(hue + 20) % 360} 90% 60% / 0.28)`,
          haystack: `${movie.title} ${movie.region} ${movie.type} ${movie.year} ${movie.genre} ${(movie.tags || []).join(" ")} ${movie.one_line} ${movie.summary} ${movie.bucket}`.toLowerCase(),
        };
      });

      const params = new URLSearchParams(location.search);
      const q = (params.get("q") || input.value || "").trim();
      input.value = q;

      const run = () => {
        const query = input.value.trim().toLowerCase();
        document.querySelector("[data-search-count]").textContent = String(
          movies.filter((movie) => movie.haystack.includes(query)).length
        );
        if (!query) {
          render(movies.slice(0, 60), query);
          return;
        }
        const result = movies.filter((movie) => movie.haystack.includes(query));
        render(result.slice(0, 120), query);
      };

      input.addEventListener("input", run);
      run();
    }

    load().catch(() => {
      mount.innerHTML = `
        <div class="empty-state">
          <h2>搜索索引暂时不可用</h2>
          <p>请稍后刷新页面再试。</p>
        </div>
      `;
    });
  }

  function initPlayerBlocks() {
    const blocks = qsa("[data-player]");
    if (!blocks.length) return;

    blocks.forEach((block) => {
      const video = qs("video", block);
      const playBtn = qs("[data-play]", block);
      const muteBtn = qs("[data-mute]", block);
      const fsBtn = qs("[data-fullscreen]", block);
      const range = qs("[data-progress]", block);
      const current = qs("[data-current]", block);
      const duration = qs("[data-duration]", block);
      const source = block.getAttribute("data-src");
      const title = block.getAttribute("data-title") || "";

      let hls = null;
      let ready = false;

      function setPlayIcon() {
        if (!playBtn) return;
        playBtn.textContent = video.paused ? "播放" : "暂停";
      }

      function syncTimes() {
        if (current) current.textContent = formatTime(video.currentTime);
        if (duration) duration.textContent = formatTime(video.duration);
        if (range && !Number.isNaN(video.duration)) {
          range.max = String(video.duration || 0);
          range.value = String(video.currentTime || 0);
        }
      }

      function attachSource() {
        if (!source) return;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            ready = true;
          });
          hls.on(window.Hls.Events.ERROR, (_, data) => {
            if (data && data.fatal && hls) {
              try {
                hls.destroy();
              } catch (err) {}
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          ready = true;
        }
      }

      function togglePlay() {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }

      attachSource();

      playBtn && playBtn.addEventListener("click", togglePlay);
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", setPlayIcon);
      video.addEventListener("pause", setPlayIcon);
      video.addEventListener("loadedmetadata", syncTimes);
      video.addEventListener("timeupdate", syncTimes);
      video.addEventListener("durationchange", syncTimes);

      if (muteBtn) {
        muteBtn.addEventListener("click", () => {
          video.muted = !video.muted;
          muteBtn.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fsBtn) {
        fsBtn.addEventListener("click", () => {
          if (video.requestFullscreen) {
            video.requestFullscreen().catch(() => {});
          }
        });
      }

      if (range) {
        range.addEventListener("input", (event) => {
          const value = Number(event.target.value);
          if (Number.isFinite(value)) {
            video.currentTime = value;
          }
        });
      }

      setPlayIcon();
      syncTimes();
    });
  }

  function initProgressBars() {
    qsa("[data-scroll-top]").forEach((button) => {
      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSearchPage();
    initPlayerBlocks();
    initProgressBars();
  });
})();
