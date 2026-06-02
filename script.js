document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Hero background parallax
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero__bg');

    if (hero && heroBg) {
        const updateHeroParallax = () => {
            const rect = hero.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            if (rect.bottom > 0 && rect.top < viewHeight) {
                const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.85)));
                heroBg.style.transform = `translate3d(0, ${progress * 48}px, 0)`;
            }
        };

        window.addEventListener('scroll', updateHeroParallax, { passive: true });
        updateHeroParallax();
    }

    // Mobile navigation
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });

    // Close nav on link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    });

    // Scroll reveal
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const top = target.offsetTop - headerHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Our Story — YouTube embed: autoplay in view, mute toggle, resume position
    const youtubeMount = document.getElementById('youtubePlayer');
    const videoSection = document.getElementById('video');
    const playBtn = document.getElementById('videoPlayBtn');
    const muteBtn = document.getElementById('videoMuteBtn');
    const VIDEO_TIME_KEY = 'eliudStoryVideoTime';
    const VIDEO_MUTED_KEY = 'eliudStoryVideoMuted';

    if (youtubeMount && videoSection) {
        const videoId = youtubeMount.dataset.videoId || 'qk_JTSOSwcs';
        let ytPlayer = null;
        let ytReady = false;
        let isSectionVisible = false;
        let isUserMuted = true;
        let timeSaveInterval = null;

        const saveVideoTime = () => {
            if (!ytReady || typeof ytPlayer.getCurrentTime !== 'function') return;
            const current = ytPlayer.getCurrentTime();
            if (current > 0) {
                sessionStorage.setItem(VIDEO_TIME_KEY, String(current));
            }
        };

        const restoreVideoTime = () => {
            if (!ytReady) return;
            const saved = parseFloat(sessionStorage.getItem(VIDEO_TIME_KEY) || '0');
            if (saved > 0) {
                ytPlayer.seekTo(saved, true);
            }
        };

        const updateMuteButton = () => {
            if (!muteBtn) return;
            muteBtn.classList.toggle('is-muted', isUserMuted);
            muteBtn.setAttribute('aria-label', isUserMuted ? 'Unmute video' : 'Mute video');
            muteBtn.setAttribute('aria-pressed', String(isUserMuted));
        };

        const applyMutedState = (isMuted) => {
            isUserMuted = isMuted;
            if (ytReady) {
                if (isMuted) {
                    ytPlayer.mute();
                } else {
                    ytPlayer.unMute();
                }
            }
            updateMuteButton();
        };

        const loadMutedPreference = () => {
            const stored = sessionStorage.getItem(VIDEO_MUTED_KEY);
            const isMuted = stored === null ? true : stored === 'true';
            applyMutedState(isMuted);
        };

        const tryPlay = () => {
            if (!ytReady) return;
            ytPlayer.playVideo();
            if (playBtn) playBtn.classList.add('hidden');
        };

        const pauseVideo = () => {
            if (!ytReady) return;
            saveVideoTime();
            ytPlayer.pauseVideo();
        };

        const startTimeSaving = () => {
            if (timeSaveInterval) return;
            timeSaveInterval = window.setInterval(() => {
                if (isSectionVisible) saveVideoTime();
            }, 1500);
        };

        const stopTimeSaving = () => {
            if (timeSaveInterval) {
                clearInterval(timeSaveInterval);
                timeSaveInterval = null;
            }
        };

        const onSectionVisible = () => {
            restoreVideoTime();
            applyMutedState(isUserMuted);
            tryPlay();
            startTimeSaving();
        };

        const onSectionHidden = () => {
            stopTimeSaving();
            pauseVideo();
        };

        const initYouTubePlayer = () => {
            ytPlayer = new YT.Player('youtubePlayer', {
                videoId,
                width: '100%',
                height: '100%',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    enablejsapi: 1,
                    fs: 0,
                    iv_load_policy: 3
                },
                events: {
                    onReady: () => {
                        ytReady = true;
                        loadMutedPreference();
                        if (isSectionVisible) {
                            onSectionVisible();
                        }
                    },
                    onStateChange: (event) => {
                        if (!playBtn) return;
                        if (event.data === YT.PlayerState.PLAYING) {
                            playBtn.classList.add('hidden');
                        } else if (
                            event.data === YT.PlayerState.PAUSED &&
                            !isSectionVisible
                        ) {
                            playBtn.classList.add('hidden');
                        }
                    }
                }
            });
        };

        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nextMuted = !isUserMuted;
                sessionStorage.setItem(VIDEO_MUTED_KEY, String(nextMuted));
                applyMutedState(nextMuted);
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                restoreVideoTime();
                tryPlay();
            });
        }

        window.addEventListener('pagehide', saveVideoTime);

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                isSectionVisible = entry.isIntersecting;
                if (entry.isIntersecting) {
                    onSectionVisible();
                } else {
                    onSectionHidden();
                }
            });
        }, { threshold: 0.35 });

        videoObserver.observe(videoSection);

        if (window.YT && window.YT.Player) {
            initYouTubePlayer();
        } else {
            window.onYouTubeIframeAPIReady = initYouTubePlayer;
        }
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.form__submit');
            const originalText = submitBtn.textContent;

            // Show sending state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual form handling)
            setTimeout(() => {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = '#4a7c59';

                // Reset form
                contactForm.reset();

                // Reset button after delay
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    // Board Member Modal
    const boardMembers = document.querySelectorAll('.board__member');
    const modal = document.getElementById('boardModal');
    const modalClose = document.getElementById('modalClose');
    const modalPhoto = document.getElementById('modalPhoto');
    const modalName = document.getElementById('modalName');
    const modalRole = document.getElementById('modalRole');
    const modalBio = document.getElementById('modalBio');

    if (modal && boardMembers.length > 0) {
        boardMembers.forEach(member => {
            member.addEventListener('click', () => {
                const photo = member.querySelector('.board__photo').textContent;
                const name = member.querySelector('.board__name').textContent;
                const role = member.querySelector('.board__role').textContent;
                const fullBio = member.getAttribute('data-full-bio');

                modalPhoto.textContent = photo;
                modalName.textContent = name;
                modalRole.textContent = role;
                modalBio.textContent = fullBio;

                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});
