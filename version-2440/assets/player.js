(function () {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-player-button]');
    var source = container.getAttribute('data-src');
    var started = false;
    var hls = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          container.classList.add('needs-interaction');
        });
      }
    }

    function attachSource() {
      if (!video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        video._hlsInstance = hls;
        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
    }

    function start() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        started = true;
        container.classList.add('is-playing');
        attachSource();
      } else if (video.paused) {
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    }

    container.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });
  });
})();
