(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobileNav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-slide") || 0);
        showSlide(target);
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  Array.prototype.slice.call(document.querySelectorAll(".filter-input")).forEach(function (input) {
    var targetId = input.getAttribute("data-filter-target");
    var target = targetId ? document.getElementById(targetId) : null;

    if (!target) {
      return;
    }

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var items = Array.prototype.slice.call(target.children);

      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-genre") || "",
          item.getAttribute("data-year") || "",
          item.textContent || ""
        ].join(" ").toLowerCase();

        item.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
      });
    });
  });

  var results = document.getElementById("searchResults");
  var searchTitle = document.getElementById("searchTitle");
  var searchInput = document.getElementById("searchInput");

  if (results && typeof moviesIndex !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();

    if (searchInput) {
      searchInput.value = q;
    }

    if (q) {
      var lower = q.toLowerCase();
      var matched = moviesIndex.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.desc]
          .join(" ")
          .toLowerCase()
          .indexOf(lower) !== -1;
      }).slice(0, 96);

      if (searchTitle) {
        searchTitle.textContent = matched.length ? "搜索结果" : "没有找到匹配内容";
      }

      results.innerHTML = matched.map(renderSearchCard).join("") || "<div class=\"intro-card\"><h2>没有找到匹配内容</h2><p>可以尝试输入剧名、地区、类型或题材关键词。</p></div>";
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function renderSearchCard(movie) {
    var tags = String(movie.tags || movie.genre || "").split(/[,，/、;；]/).filter(Boolean).slice(0, 3);
    var tagHtml = tags.map(function (tag) {
      return "<span>" + escapeHtml(tag.trim()) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"movie-cover\" href=\"./" + escapeHtml(movie.file) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"type-badge\">" + escapeHtml(movie.type || "影视") + "</span>" +
      "</a>" +
      "<div class=\"movie-body\">" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region || "热播") + "</span><span>" + escapeHtml(movie.year || "精选") + "</span></div>" +
      "<h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.desc || "精彩内容正在热播。") + "</p>" +
      "<div class=\"tag-row\">" + tagHtml + "</div>" +
      "</div>" +
      "</article>";
  }
})();
