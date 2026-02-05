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
    const lines = document.querySelectorAll('.philosophy__line');

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
    lines.forEach(el => observer.observe(el));

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

    // Video player
    const video = document.getElementById('companyVideo');
    const playBtn = document.getElementById('videoPlayBtn');

    if (video && playBtn) {
        playBtn.addEventListener('click', () => {
            video.play();
            playBtn.classList.add('hidden');
        });

        video.addEventListener('pause', () => {
            playBtn.classList.remove('hidden');
        });

        video.addEventListener('ended', () => {
            playBtn.classList.remove('hidden');
        });

        video.addEventListener('play', () => {
            playBtn.classList.add('hidden');
        });
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
