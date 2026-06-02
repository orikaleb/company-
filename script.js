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

    }

    // Legal modal (Privacy / Terms)
    const legalContent = {
        privacy: {
            title: 'Privacy Policy',
            html: `
                <p class="legal-modal__updated">Last updated: June 1, 2026</p>
                <p>Eliud Holdings ("we," "us," or "our") respects your privacy. This policy describes how we collect, use, and protect information when you visit our website or contact us.</p>
                <h3>Information we collect</h3>
                <p>We may collect information you voluntarily provide through our contact form (such as your name, email address, subject, and message) and technical data such as browser type, device information, and general usage patterns through standard server logs.</p>
                <h3>How we use information</h3>
                <ul>
                    <li>To respond to inquiries and communicate with you</li>
                    <li>To operate, maintain, and improve our website</li>
                    <li>To comply with applicable legal obligations</li>
                </ul>
                <h3>Sharing</h3>
                <p>We do not sell your personal information. We may share data with trusted service providers who assist in operating our website, subject to confidentiality obligations, or when required by law.</p>
                <h3>Security & retention</h3>
                <p>We use reasonable administrative and technical measures to protect information. We retain data only as long as needed for the purposes described in this policy.</p>
                <h3>Your rights</h3>
                <p>Depending on your location, you may have rights to access, correct, or delete personal information we hold about you. Contact us at <a href="mailto:contact@eliudholdings.com">contact@eliudholdings.com</a> to make a request.</p>
                <h3>Changes</h3>
                <p>We may update this policy from time to time. Continued use of the site after changes constitutes acceptance of the revised policy.</p>
            `
        },
        terms: {
            title: 'Terms of Use',
            html: `
                <p class="legal-modal__updated">Last updated: June 1, 2026</p>
                <p>By accessing this website, you agree to these Terms of Use. If you do not agree, please do not use the site.</p>
                <h3>Use of the site</h3>
                <p>This website is provided for general information about Eliud Holdings. Content is for informational purposes only and does not constitute an offer, solicitation, or investment advice.</p>
                <h3>Intellectual property</h3>
                <p>All text, graphics, logos, and other materials on this site are owned by or licensed to Eliud Holdings and may not be copied, modified, or distributed without prior written permission.</p>
                <h3>Disclaimer</h3>
                <p>We strive for accuracy but make no warranties that content is complete, current, or error-free. Use of the site is at your own risk.</p>
                <h3>Limitation of liability</h3>
                <p>To the fullest extent permitted by law, Eliud Holdings shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website.</p>
                <h3>Links</h3>
                <p>Our site may link to third-party websites. We are not responsible for their content or privacy practices.</p>
                <h3>Governing law</h3>
                <p>These terms are governed by applicable laws in the jurisdiction where Eliud Holdings operates, without regard to conflict-of-law principles.</p>
                <h3>Contact</h3>
                <p>Questions about these terms: <a href="mailto:contact@eliudholdings.com">contact@eliudholdings.com</a></p>
            `
        }
    };

    const legalModal = document.getElementById('legalModal');
    const legalModalClose = document.getElementById('legalModalClose');
    const legalModalTitle = document.getElementById('legalModalTitle');
    const legalModalBody = document.getElementById('legalModalBody');
    const legalTriggers = document.querySelectorAll('[data-legal]');

    const openLegalModal = (key) => {
        const content = legalContent[key];
        if (!content || !legalModal) return;

        legalModalTitle.textContent = content.title;
        legalModalBody.innerHTML = content.html;
        legalModal.classList.add('active');
        legalModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        legalModalClose?.focus();
    };

    const closeLegalModal = () => {
        if (!legalModal) return;
        legalModal.classList.remove('active');
        legalModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (legalModal && legalTriggers.length > 0) {
        legalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                openLegalModal(trigger.getAttribute('data-legal'));
            });
        });

        legalModalClose?.addEventListener('click', closeLegalModal);

        legalModal.addEventListener('click', (e) => {
            if (e.target === legalModal) {
                closeLegalModal();
            }
        });
    }

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (legalModal && legalModal.classList.contains('active')) {
            closeLegalModal();
        }
    });
});
