document.addEventListener('DOMContentLoaded', () => {
    /* --- Preloader --- */
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('fade-out');
            document.body.classList.remove('preloader-active');
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }
    }, 3200);

    /* --- Sticky Header & Parallax --- */
    const header = document.getElementById('header');
    const heroBg = document.querySelector('.hero-bg-placeholder');

    window.addEventListener('scroll', () => {
        // Sticky Header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Parallax Effect
        const scrollPosition = window.scrollY;
        if (heroBg && scrollPosition < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        }
    });

    /* --- Mobile Menu Toggle --- */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Ensure menu is visible against the background
        if (hamburger.classList.contains('active')) {
            header.style.backgroundColor = 'rgba(253, 251, 247, 0.98)';
        } else if (window.scrollY <= 50) {
            header.style.backgroundColor = 'transparent';
        }
    });

    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            if (window.scrollY <= 50) {
                header.style.backgroundColor = 'transparent';
            }
        });
    });

    /* --- Scroll Animation Observer --- */
    const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });

    /* --- Reviews Slider --- */
    const track = document.getElementById('slider-track');
    const cards = document.querySelectorAll('.review-card');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;

    function updateSlider() {
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Translate the track depending on current index
        // Assuming each card takes 100% width
        const amountToMove = currentIndex * 100;
        track.style.transform = `translateX(-${amountToMove}%)`;
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === cards.length - 1) ? 0 : currentIndex + 1;
            updateSlider();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === 0) ? cards.length - 1 : currentIndex - 1;
            updateSlider();
        });

        // Initialize first slide as active
        updateSlider();

        // Optional: Auto slider
        setInterval(() => {
            currentIndex = (currentIndex === cards.length - 1) ? 0 : currentIndex + 1;
            updateSlider();
        }, 6000);
    }

    /* --- Apple Carousel --- */
    const carouselContainer = document.getElementById('signature-carousel');
    if (carouselContainer) {
        const track = carouselContainer.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const prevBtn = carouselContainer.querySelector('.carousel-arrow.prev');
        const nextBtn = carouselContainer.querySelector('.carousel-arrow.next');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');

        let currentIndex = Math.floor(slides.length / 2); // start in middle
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;
        let autoSlideInterval;

        // Setup initial dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel(true);
                resetAutoSlide();
            });
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        function updateCarousel(animate = true) {
            slides.forEach((slide, index) => {
                if (index === currentIndex) slide.classList.add('active');
                else slide.classList.remove('active');
            });

            dots.forEach((dot, index) => {
                if (index === currentIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });

            const slideWidth = slides[0].clientWidth;
            const trackWidth = carouselContainer.clientWidth;
            const centerOffset = (trackWidth - slideWidth) / 2;

            currentTranslate = -(currentIndex * slideWidth) + centerOffset;
            prevTranslate = currentTranslate;

            track.style.transition = animate ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        // Drag Events
        track.addEventListener('mousedown', touchStart);
        track.addEventListener('touchstart', touchStart, { passive: true });
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('mouseleave', touchEnd);
        track.addEventListener('touchend', touchEnd);
        track.addEventListener('mousemove', touchMove);
        track.addEventListener('touchmove', touchMove, { passive: true });

        function touchStart(e) {
            isDragging = true;
            startPos = getPositionX(e);
            animationID = requestAnimationFrame(animation);
            track.style.transition = 'none';
            pauseAutoSlide();
        }

        function touchMove(e) {
            if (isDragging) {
                const currentPosition = getPositionX(e);
                currentTranslate = prevTranslate + currentPosition - startPos;

                // Subtle parallax on images during drag
                const dragDiff = currentPosition - startPos;
                slides.forEach(slide => {
                    const img = slide.querySelector('.card-image-placeholder span');
                    if (img) img.style.transform = `translateX(${-dragDiff * 0.05}px)`;
                });
            }
        }

        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);

            const movedBy = currentTranslate - prevTranslate;

            if (movedBy < -50 && currentIndex < slides.length - 1) currentIndex += 1;
            else if (movedBy > 50 && currentIndex > 0) currentIndex -= 1;

            // Reset parallax
            slides.forEach(slide => {
                const img = slide.querySelector('.card-image-placeholder span');
                if (img) img.style.transform = `translateX(0)`;
            });

            updateCarousel(true);
            startAutoSlide();
        }

        function getPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }

        function animation() {
            track.style.transform = `translateX(${currentTranslate}px)`;
            if (isDragging) requestAnimationFrame(animation);
        }

        // Buttons
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel(true);
            resetAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel(true);
            resetAutoSlide();
        });

        // Auto-Slide and Hover
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateCarousel(true);
            }, 5000);
        }

        function pauseAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        function resetAutoSlide() {
            pauseAutoSlide();
            startAutoSlide();
        }

        // Listeners for hover and pause
        carouselContainer.addEventListener('mouseenter', pauseAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);

        // Responsive Init
        window.addEventListener('resize', () => {
            updateCarousel(false);
        });

        setTimeout(() => updateCarousel(false), 50);
        startAutoSlide();
    }

    /* --- Smooth Scrolling for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
