/* Folly I / II: numbered MP4 fragments presented on one authored timeline.
   Actual GitHub layout (2026-10-14):
     attachments/effluent-sedimentation/folly-1/1.mp4 ... 6.mp4
     attachments/aether-scorched-earth/folly-2/1.mp4 ... 7.mp4
   Clip starts follow chapterData in script.js. Incomplete collections fall
   back to the original whole-film MP4 rather than ending partway through.
   An optional FollySegmentConfig[key] may specify an alternate folder URL
   (numbered MP4s) or the complete ordered array of MP4 URLs for a CDN. */
(function () {
    'use strict';

    var active = null;
    var generation = 0;
    var instances = new WeakMap();

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, Number(value) || 0));
    }

    function signal(video) {
        if (video && video.isConnected) video.dispatchEvent(new Event('timeupdate'));
    }

    function timeline(video) {
        var player = video && instances.get(video);
        if (player && !player.destroyed) {
            var total = player.duration();
            var now = player.time();
            return { time: now, duration: total,
                progress: total > 0 ? clamp(now / total, 0, 1) : 0,
                segmented: true, starts: player.starts };
        }
        var duration = Number(video && video.duration) || 0;
        var time = Number(video && video.currentTime) || 0;
        if (!Number.isFinite(duration)) duration = 0;
        return { time: time, duration: duration,
            progress: duration > 0 ? clamp(time / duration, 0, 1) : 0,
            segmented: false, starts: [] };
    }

    function resolvePartPaths(key, count, original) {
        var configuration = window.FollySegmentConfig?.[key];
        if (Array.isArray(configuration) && configuration.length === count) {
            return configuration.map(String);
        }
        var originalFolder = original.slice(0, original.lastIndexOf('/') + 1);
        // Numbered clips are stored inside their own work subdirectory.
        var folder = (typeof configuration === 'string' && configuration.trim())
            ? configuration.trim()
            : originalFolder + key + '/';
        if (!folder.endsWith('/')) folder += '/';
        return Array.from({ length: count }, function (_, i) {
            return folder + String(i + 1) + '.mp4';
        });
    }

    function Player(video, key, chapterList, original, availablePaths) {
        this.video = video;
        this.key = key;
        this.original = original;
        this.parts = availablePaths || resolvePartPaths(key, chapterList.length, original);
        this.starts = chapterList.slice(0, this.parts.length).map(function (ch) { return Number(ch.time); });
        this.index = 0;
        this.offset = 0;
        this.loading = true;
        this.wantPlay = false;
        this.destroyed = false;
        this.lastLength = 0;
        this.probe = null;
        this.readyCallback = null;
        this.pendingTimer = 0;

        var self = this;
        this.onMetadata = function () {
            if (self.destroyed) return;
            self.loading = false;
            if (self.index === self.parts.length - 1 && Number.isFinite(video.duration) && video.duration > 0) {
                self.lastLength = video.duration;
            }
            try {
                video.currentTime = clamp(self.offset, 0, Math.max(0, video.duration - 0.02));
            } catch (_) {}
            self.changed();
            if (self.readyCallback) {
                var callback = self.readyCallback;
                self.readyCallback = null;
                callback(true);
            }
            if (self.wantPlay) {
                var attempt = video.play();
                if (attempt && attempt.catch) attempt.catch(function () {});
            }
        };
        this.onEnded = function () {
            if (self.destroyed) return;
            if (self.index < self.parts.length - 1) self.load(self.index + 1, 0, true);
            else self.changed();
        };
        this.onError = function () {
            if (self.destroyed) return;
            if (self.readyCallback) {
                var callback = self.readyCallback;
                self.readyCallback = null;
                callback(false);
            } else {
                self.fallback();
            }
        };
        this.onTick = function () {
            if (self.index === self.parts.length - 1 &&
                Number.isFinite(video.duration) && video.duration > 0 &&
                self.lastLength !== video.duration) self.lastLength = video.duration;
        };
        video.addEventListener('loadedmetadata', this.onMetadata);
        video.addEventListener('ended', this.onEnded);
        video.addEventListener('error', this.onError);
        video.addEventListener('timeupdate', this.onTick);
    }

    Player.prototype.duration = function () {
        var lastStart = this.starts[this.starts.length - 1];
        var previousInterval = this.starts.length > 1
            ? lastStart - this.starts[this.starts.length - 2] : 30;
        return lastStart + (this.lastLength > 0 ? this.lastLength : Math.max(15, previousInterval));
    };
    Player.prototype.time = function () {
        var local = this.loading ? this.offset : Number(this.video.currentTime) || 0;
        var end = this.index < this.starts.length - 1
            ? this.starts[this.index + 1] : this.duration();
        return clamp(this.starts[this.index] + local, this.starts[this.index], end);
    };
    Player.prototype.changed = function () { signal(this.video); };
    Player.prototype.load = function (index, offset, autoplay) {
        if (this.destroyed) return;
        this.index = index;
        this.offset = Math.max(0, Number(offset) || 0);
        this.wantPlay = Boolean(autoplay);
        this.loading = true;
        try { this.video.pause(); } catch (_) {}
        this.video.src = this.parts[index];
        this.video.load();
        // A chapter click is a user gesture on iOS Safari. Initiate play here,
        // not only after asynchronous metadata, to retain that activation.
        if (this.wantPlay) {
            try {
                var attempt = this.video.play();
                if (attempt && attempt.catch) attempt.catch(function () {});
            } catch (_) {}
        }
        this.changed();
    };
    Player.prototype.seek = function (absolute, autoplay) {
        if (this.destroyed) return;
        var time = clamp(absolute, 0, Math.max(0, this.duration() - 0.02));
        var index = 0;
        for (var i = 1; i < this.starts.length; i++) {
            if (time >= this.starts[i]) index = i;
            else break;
        }
        var playAfter = autoplay === true || (autoplay !== false && (this.wantPlay || !this.video.paused));
        if (index !== this.index) {
            this.load(index, time - this.starts[index], playAfter);
        } else if (this.loading) {
            this.offset = time - this.starts[index];
            this.wantPlay = playAfter;
            this.changed();
        } else {
            this.video.currentTime = clamp(time - this.starts[index], 0, Math.max(0, this.video.duration - 0.02));
            this.changed();
            if (playAfter && this.video.paused) {
                var attempt = this.video.play();
                if (attempt && attempt.catch) attempt.catch(function () {});
            }
        }
    };
    Player.prototype.play = function () {
        if (this.video.ended && this.index === this.parts.length - 1) {
            this.seek(0, true);
            return;
        }
        this.wantPlay = true;
        if (this.loading) return;
        var attempt = this.video.play();
        if (attempt && attempt.catch) attempt.catch(function () {});
    };
    Player.prototype.pause = function () {
        this.wantPlay = false;
        this.video.pause();
    };
    Player.prototype.activate = function () {
        var self = this;
        return new Promise(function (resolve) {
            self.readyCallback = function (ok) {
                clearTimeout(self.pendingTimer);
                self.pendingTimer = 0;
                resolve(ok);
            };
            self.pendingTimer = setTimeout(function () {
                if (self.readyCallback) {
                    self.readyCallback = null;
                    resolve(false);
                }
            }, 15000);
            self.load(0, 0, false);
        }).then(function (ok) {
            if (ok && !self.destroyed) self.probeLast();
            return ok;
        });
    };
    Player.prototype.probeLast = function () {
        var self = this;
        if (this.destroyed || this.parts.length < 2) return;
        var probe = document.createElement('video');
        this.probe = probe;
        probe.preload = 'metadata';
        probe.muted = true;
        function finish() {
            if (!self.destroyed && Number.isFinite(probe.duration) && probe.duration > 0) {
                self.lastLength = probe.duration;
                self.changed();
            }
            probe.removeAttribute('src');
            probe.load();
            if (self.probe === probe) self.probe = null;
        }
        probe.addEventListener('loadedmetadata', finish, { once: true });
        probe.addEventListener('error', finish, { once: true });
        probe.src = this.parts[this.parts.length - 1];
        probe.load();
    };
    Player.prototype.fallback = function () {
        if (this.destroyed) return;
        var current = this.time();
        var wasPlaying = this.wantPlay;
        this.destroy();
        if (active === this) active = null;
        var video = this.video;
        video.addEventListener('loadedmetadata', function restore() {
            try { video.currentTime = Math.min(current, Math.max(0, video.duration - .02)); } catch (_) {}
            if (wasPlaying) {
                var attempt = video.play();
                if (attempt && attempt.catch) attempt.catch(function () {});
            }
            signal(video);
        }, { once: true });
        // This repository no longer contains a complete film MP4. A failed
        // segment must not fall back to a permanently missing whole-film URL.
        // Show the first confirmed fragment instead of leaving a blank player.
        video.src = this.parts[0] || this.original;
        video.load();
    };
    Player.prototype.destroy = function () {
        if (this.destroyed) return;
        this.destroyed = true;
        clearTimeout(this.pendingTimer);
        this.video.removeEventListener('loadedmetadata', this.onMetadata);
        this.video.removeEventListener('ended', this.onEnded);
        this.video.removeEventListener('error', this.onError);
        this.video.removeEventListener('timeupdate', this.onTick);
        if (this.probe) {
            this.probe.removeAttribute('src');
            this.probe.load();
            this.probe = null;
        }
        if (this.readyCallback) {
            var callback = this.readyCallback;
            this.readyCallback = null;
            callback(false);
        }
        instances.delete(this.video);
    };

    function destroy() {
        generation++;
        if (active) active.destroy();
        active = null;
    }

    async function prepare(video, key, chapters, original) {
        destroy();
        if (!video || !Array.isArray(chapters) || chapters.length < 2 || !original) return false;
        var serial = generation;
        var names = resolvePartPaths(key, chapters.length, original);
        function isCurrent() { return serial === generation && video.isConnected; }
        async function exists(src) {
            try {
                var result = await fetch(src, { method: 'HEAD', cache: 'default' });
                return result.ok;
            } catch (_) { return false; }
        }
        // Resolve the contiguous upload prefix. Folly I currently has 1.mp4
        // and 2.mp4, with chapters 3–6 absent; its old whole-film fallback
        // points to a nonexistent file. Play existing material immediately,
        // and stop gracefully before missing parts instead of a blank screen.
        var available = await Promise.all(names.map(exists));
        if (!isCurrent()) return false;
        var prefix = 0;
        while (prefix < available.length && available[prefix]) prefix++;
        // A host that blocks HEAD must not prevent playback altogether.
        // Let the video element try the first fragment directly in that case.
        if (!prefix) prefix = 1;
        var player = new Player(video, key, chapters, original, names.slice(0, prefix));
        active = player;
        instances.set(video, player);
        var ready = await player.activate();
        if (!isCurrent()) return false;
        if (!ready) {
            player.destroy();
            if (active === player) active = null;
            // This is a last resort: the original may have been retired.
            video.src = original;
            video.load();
        }
        if (ready) reportAvailability(video, key, prefix, chapters.length);
        return ready;
    }

    function reportAvailability(video, key, available, total) {
        video.dataset.follyAvailableSegments = String(available);
        video.dataset.follyTotalSegments = String(total);
        var viewer = video.closest('#attachment-viewer');
        if (!viewer) return;
        var incomplete = available < total;
        var lang = String(document.documentElement.lang || 'zh').toLowerCase();
        var copy = lang.startsWith('en') ? 'Only ' + available + '/' + total + ' clips uploaded'
            : lang.startsWith('ja') ? 'アップロード済み ' + available + '/' + total + ' クリップ'
            : '当前仅有 ' + available + '/' + total + ' 段影像';
        viewer.querySelectorAll('.video-chapters .chapter-button, .mobile-folly-chapter-strip .chapter-button')
            .forEach(function (button, index) {
                var missing = index >= available;
                button.classList.toggle('folly-segment-unavailable', missing);
                button.setAttribute('aria-disabled', missing ? 'true' : 'false');
                if (missing) button.title = copy;
                else button.removeAttribute('title');
            });
        var note = viewer.querySelector('.folly-segments-availability-note');
        if (incomplete) {
            if (!note) {
                note = document.createElement('div');
                note.className = 'folly-segments-availability-note';
                viewer.appendChild(note);
            }
            note.textContent = copy;
        } else if (note) note.remove();
    }

    function seek(video, seconds, options) {
        var player = video && instances.get(video);
        if (player && !player.destroyed) player.seek(seconds, options && options.play);
        else if (video && Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime = clamp(seconds, 0, Math.max(0, video.duration - .02));
            if (options && options.play) {
                var attempt = video.play();
                if (attempt && attempt.catch) attempt.catch(function () {});
            }
        }
    }
    function play(video) {
        var player = video && instances.get(video);
        if (player && !player.destroyed) player.play();
        else if (video) {
            if (video.ended) video.currentTime = 0;
            var attempt = video.play();
            if (attempt && attempt.catch) attempt.catch(function () {});
        }
    }
    function pause(video) {
        var player = video && instances.get(video);
        if (player && !player.destroyed) player.pause();
        else if (video) video.pause();
    }

    function syncDesktopBar(video, bar) {
        var timelineState = timeline(video);
        var root = bar && bar.parentElement;
        if (!bar || !root) return timelineState;
        root.classList.toggle('is-segmented', timelineState.segmented);
        if (!timelineState.segmented) {
            root.querySelectorAll('.video-progress-section').forEach(function (el) { el.remove(); });
            bar.style.height = String(timelineState.progress * 100) + '%';
            return timelineState;
        }
        bar.style.height = '0%';
        var segments = Array.from(root.querySelectorAll('.video-progress-section'));
        if (segments.length !== timelineState.starts.length) {
            segments.forEach(function (el) { el.remove(); });
            segments = timelineState.starts.map(function () {
                var node = document.createElement('span');
                node.className = 'video-progress-section';
                var fill = document.createElement('span');
                fill.className = 'video-progress-section-fill';
                node.appendChild(fill);
                root.appendChild(node);
                return node;
            });
        }
        segments.forEach(function (node, i) {
            var start = timelineState.starts[i];
            var end = i < segments.length - 1 ? timelineState.starts[i + 1] : timelineState.duration;
            var span = Math.max(.01, end - start);
            var proportion = clamp((timelineState.time - start) / span, 0, 1);
            node.style.flexGrow = String(span);
            node.firstElementChild.style.height = String(proportion * 100) + '%';
            node.classList.toggle('is-current', proportion > 0 && proportion < 1);
        });
        return timelineState;
    }

    function syncMobileTicks(video, ui) {
        if (!ui) return;
        var track = ui.querySelector('.mobile-folly-segment-ticks');
        if (!track) return;
        var state = timeline(video);
        var signature = state.segmented ? state.starts.join(',') + ':' + state.duration : '';
        if (track.dataset.signature === signature) return;
        track.dataset.signature = signature;
        track.replaceChildren();
        if (!state.segmented || !state.duration) return;
        state.starts.slice(1).forEach(function (start) {
            var tick = document.createElement('span');
            tick.className = 'mobile-folly-segment-tick';
            tick.style.left = String(100 * start / state.duration) + '%';
            track.appendChild(tick);
        });
    }

    window.FollySegments = {
        prepare: prepare, destroy: destroy, timeline: timeline,
        seek: seek, play: play, pause: pause,
        syncDesktopBar: syncDesktopBar, syncMobileTicks: syncMobileTicks
    };
})();
