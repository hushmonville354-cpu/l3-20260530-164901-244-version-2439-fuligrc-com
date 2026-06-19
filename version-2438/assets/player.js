(function () {
    const players = document.querySelectorAll('[data-player]');

    const setMessage = function (player, message) {
        const messageNode = player.querySelector('[data-player-message]');
        if (messageNode) {
            messageNode.textContent = message || '';
        }
    };

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const source = player.dataset.videoSrc;
        let hlsInstance = null;
        let initialized = false;

        const initializePlayer = function () {
            if (!video || !source) {
                setMessage(player, '当前播放源暂不可用。');
                return Promise.reject(new Error('Missing video source'));
            }

            if (initialized) {
                return Promise.resolve();
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage(player, '播放遇到网络或媒体错误，请刷新后重试。');
                    }
                });
                return Promise.resolve();
            }

            setMessage(player, '当前浏览器不支持 HLS 播放，请更换现代浏览器。');
            return Promise.reject(new Error('HLS is not supported'));
        };

        const startPlayback = function () {
            initializePlayer()
                .then(function () {
                    return video.play();
                })
                .then(function () {
                    if (button) {
                        button.classList.add('hidden');
                    }
                    setMessage(player, '');
                })
                .catch(function () {
                    setMessage(player, '请再次点击播放按钮，或确认浏览器允许媒体播放。');
                });
        };

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
