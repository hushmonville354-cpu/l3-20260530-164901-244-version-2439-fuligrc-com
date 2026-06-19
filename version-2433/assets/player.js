(function () {
  var video = document.getElementById("moviePlayer");
  var layer = document.getElementById("playerLayer");
  var button = document.getElementById("playerButton");
  var hls = null;
  var bound = false;

  if (!video || typeof videoManifest === "undefined") {
    return;
  }

  function bindVideo() {
    if (bound) {
      return;
    }

    bound = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoManifest;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoManifest);
      hls.attachMedia(video);
      return;
    }

    video.src = videoManifest;
  }

  function startVideo(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    bindVideo();

    if (layer) {
      layer.classList.add("is-hidden");
    }

    var playAction = video.play();

    if (playAction && typeof playAction.catch === "function") {
      playAction.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener("click", startVideo);
  }

  if (button) {
    button.addEventListener("click", startVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    }
  });
})();
