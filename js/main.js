// Custom Cursor Logic
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
const interactives = document.querySelectorAll('.interactive');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
const featuredDropImage = document.getElementById('featured-drop-image');
const featuredProgressDots = document.querySelectorAll('[data-featured-index]');

if (featuredDropImage) {
    const featuredImageShell = featuredDropImage.closest('.hero-image-shell');
    const featuredImageOptions = [
        { src: 'images/Lamine.webp', alt: 'Lamine featured jersey' },
        { src: 'images/Gnabry.png', alt: 'Gnabry featured jersey' }
    ];

    const featuredRotateIntervalMs = 10000;
    const featuredFlipOutDurationMs = 320;
    const featuredFlipInDurationMs = 420;
    let currentFeaturedIndex = 0;
    let featuredFlipInProgress = false;
    let featuredGlowAnimation = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const swipeVelocityThreshold = 0.65;
    const swipeDistanceThresholdPx = 70;
    const holdMaxTiltDeg = 9;

    let featurePointerActive = false;
    let featurePointerId = null;
    let featurePointerStartX = 0;
    let featurePointerStartY = 0;
    let featurePointerLastX = 0;
    let featurePointerLastY = 0;
    let featurePointerLastTime = 0;
    let featurePointerVelocityX = 0;
    let featurePointerSwiped = false;

    const setFeaturedImage = (index) => {
        const image = featuredImageOptions[index];
        featuredDropImage.src = image.src;
        featuredDropImage.alt = image.alt;

        featuredProgressDots.forEach((dot) => {
            const dotIndex = Number(dot.getAttribute('data-featured-index'));
            const isActive = dotIndex === index;
            dot.classList.toggle('is-active', isActive);
        });
    };

    const runFlipOut = () => featuredDropImage.animate([
        {
            transform: 'perspective(1500px) translateX(0px) rotateY(0deg) rotateZ(0deg) scale(1)',
            opacity: 1,
            filter: 'saturate(1) blur(0px)'
        },
        {
            transform: 'perspective(1500px) translateX(12px) rotateY(52deg) rotateZ(0.4deg) scale(0.985)',
            opacity: 0.35,
            filter: 'saturate(1.1) blur(0.8px)'
        },
        {
            transform: 'perspective(1500px) translateX(22px) rotateY(92deg) rotateZ(0.8deg) scale(0.95)',
            opacity: 0.06,
            filter: 'saturate(1.2) blur(2.8px)'
        }
    ], {
        duration: featuredFlipOutDurationMs,
        easing: 'cubic-bezier(0.4, 0, 0.25, 1)',
        fill: 'forwards'
    }).finished;

    const runFlipIn = () => featuredDropImage.animate([
        {
            transform: 'perspective(1500px) translateX(-22px) rotateY(-92deg) rotateZ(-0.8deg) scale(0.95)',
            opacity: 0.06,
            filter: 'saturate(1.2) blur(2.8px)'
        },
        {
            transform: 'perspective(1500px) translateX(5px) rotateY(14deg) rotateZ(0.15deg) scale(1.012)',
            opacity: 0.88,
            filter: 'saturate(1.04) blur(0.2px)'
        },
        {
            transform: 'perspective(1500px) translateX(0px) rotateY(0deg) rotateZ(0deg) scale(1)',
            opacity: 1,
            filter: 'saturate(1) blur(0px)'
        }
    ], {
        duration: featuredFlipInDurationMs,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
    }).finished;

    const runGlowPulse = () => {
        if (!featuredImageShell || prefersReducedMotion) {
            return;
        }

        if (featuredGlowAnimation) {
            featuredGlowAnimation.cancel();
        }

        featuredGlowAnimation = featuredImageShell.animate([
            {
                boxShadow: '0 28px 90px rgba(0, 0, 0, 0.65), 0 0 45px rgba(0, 240, 255, 0.15)'
            },
            {
                boxShadow: '0 32px 96px rgba(0, 0, 0, 0.7), 0 0 65px rgba(0, 240, 255, 0.42), 0 0 18px rgba(176, 0, 255, 0.22)'
            },
            {
                boxShadow: '0 28px 90px rgba(0, 0, 0, 0.65), 0 0 45px rgba(0, 240, 255, 0.15)'
            }
        ], {
            duration: featuredFlipOutDurationMs + featuredFlipInDurationMs + 120,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards'
        });

        featuredGlowAnimation.finished.catch(() => {
            // Ignore cancellation rejections when a new pulse starts early.
        });
    };

    const runChromaticFlash = () => {
        if (prefersReducedMotion) {
            return;
        }

        featuredDropImage.animate([
            {
                filter: 'saturate(1) contrast(1) hue-rotate(0deg) drop-shadow(0 0 0 rgba(0, 240, 255, 0))'
            },
            {
                filter: 'saturate(1.35) contrast(1.12) hue-rotate(8deg) drop-shadow(0 0 16px rgba(0, 240, 255, 0.6)) drop-shadow(0 0 22px rgba(176, 0, 255, 0.38))'
            },
            {
                filter: 'saturate(1) contrast(1) hue-rotate(0deg) drop-shadow(0 0 0 rgba(0, 240, 255, 0))'
            }
        ], {
            duration: 320,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'none'
        });
    };

    const setFeatureShellRestState = () => {
        if (!featuredImageShell) {
            return;
        }

        featuredImageShell.style.transition = 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)';
        featuredImageShell.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    const setFeatureShellHoldState = (pointerX, pointerY) => {
        if (!featuredImageShell) {
            return;
        }

        const rect = featuredImageShell.getBoundingClientRect();
        const relativeX = pointerX - rect.left;
        const relativeY = pointerY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((relativeX - centerX) / centerX) * holdMaxTiltDeg;
        const rotateX = ((relativeY - centerY) / centerY) * -holdMaxTiltDeg;

        featuredImageShell.style.transition = 'none';
        featuredImageShell.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    };

    const normalizeFeaturedIndex = (index) => {
        const total = featuredImageOptions.length;
        return ((index % total) + total) % total;
    };

    const showFeaturedImageByOffset = async (offset) => {
        if (featuredFlipInProgress || featuredImageOptions.length < 2) {
            return;
        }

        featuredFlipInProgress = true;
        try {
            const direction = offset >= 0 ? 1 : -1;

            if (prefersReducedMotion) {
                currentFeaturedIndex = normalizeFeaturedIndex(currentFeaturedIndex + direction);
                setFeaturedImage(currentFeaturedIndex);
                return;
            }

            runGlowPulse();
            await runFlipOut();
            currentFeaturedIndex = normalizeFeaturedIndex(currentFeaturedIndex + direction);
            setFeaturedImage(currentFeaturedIndex);
            runChromaticFlash();

            await runFlipIn();
        } finally {
            featuredFlipInProgress = false;
        }
    };

    const showNextFeaturedImage = () => showFeaturedImageByOffset(1);

    const handleFeaturedPointerDown = (event) => {
        if (!featuredImageShell || featuredFlipInProgress) {
            return;
        }

        const targetElement = event.target;
        if (targetElement instanceof Element && targetElement.closest('button, a')) {
            return;
        }

        featurePointerActive = true;
        featurePointerId = event.pointerId;
        featurePointerStartX = event.clientX;
        featurePointerStartY = event.clientY;
        featurePointerLastX = event.clientX;
        featurePointerLastY = event.clientY;
        featurePointerLastTime = event.timeStamp;
        featurePointerVelocityX = 0;
        featurePointerSwiped = false;

        featuredImageShell.setPointerCapture(event.pointerId);
        setFeatureShellHoldState(event.clientX, event.clientY);
    };

    const handleFeaturedPointerMove = (event) => {
        if (!featurePointerActive || event.pointerId !== featurePointerId || !featuredImageShell) {
            return;
        }

        const deltaTime = Math.max(1, event.timeStamp - featurePointerLastTime);
        featurePointerVelocityX = (event.clientX - featurePointerLastX) / deltaTime;
        featurePointerLastX = event.clientX;
        featurePointerLastY = event.clientY;
        featurePointerLastTime = event.timeStamp;

        setFeatureShellHoldState(event.clientX, event.clientY);
    };

    const handleFeaturedPointerEnd = (event) => {
        if (!featurePointerActive || event.pointerId !== featurePointerId || !featuredImageShell) {
            return;
        }

        const traveledX = event.clientX - featurePointerStartX;
        const traveledY = event.clientY - featurePointerStartY;
        const isMostlyHorizontal = Math.abs(traveledX) > Math.abs(traveledY);
        const isFastSwipe = Math.abs(featurePointerVelocityX) >= swipeVelocityThreshold;
        const traveledEnough = Math.abs(traveledX) >= swipeDistanceThresholdPx;

        if (isMostlyHorizontal && isFastSwipe && traveledEnough && !featurePointerSwiped) {
            featurePointerSwiped = true;
            const offset = traveledX < 0 ? 1 : -1;
            showFeaturedImageByOffset(offset);
        }

        try {
            featuredImageShell.releasePointerCapture(featurePointerId);
        } catch {
            // Ignore release errors if capture has already ended.
        }

        featurePointerActive = false;
        featurePointerId = null;
        setFeatureShellRestState();
    };

    // Preload featured images so the flip transition stays smooth.
    featuredImageOptions.forEach((item) => {
        const preloaded = new Image();
        preloaded.src = item.src;
    });

    setFeaturedImage(currentFeaturedIndex);
    setFeatureShellRestState();
    featuredDropImage.onerror = () => {
        currentFeaturedIndex = normalizeFeaturedIndex(currentFeaturedIndex + 1);
        setFeaturedImage(currentFeaturedIndex);
    };

    if (featuredImageShell) {
        featuredImageShell.style.touchAction = 'pan-y';
        featuredImageShell.addEventListener('pointerdown', handleFeaturedPointerDown);
        featuredImageShell.addEventListener('pointermove', handleFeaturedPointerMove);
        featuredImageShell.addEventListener('pointerup', handleFeaturedPointerEnd);
        featuredImageShell.addEventListener('pointercancel', handleFeaturedPointerEnd);
    }

    if (featuredImageOptions.length > 1) {
        window.setInterval(showNextFeaturedImage, featuredRotateIntervalMs);
    }
}

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    if (cursorDot) {
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
    }

    if (cursorOutline) {
        // Add a slight delay to the outline for a smooth trailing effect
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: 'forwards' });
    }
});

interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
    });
});

// Mobile menu toggle and auto-close behavior.
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileMenuLinks.forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// 3D Magnetic Tilt Effect for Product Cards
const cards = document.querySelectorAll('.tilt-card');

cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 15 degrees)
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        // Reset card to default state
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
});

// Navbar blur and hide/show based on scroll direction.
const navbar = document.getElementById('navbar');
let lastToggleScrollY = window.scrollY;
const navbarToggleThreshold = 10;
window.addEventListener('scroll', () => {
    if (!navbar) {
        return;
    }

    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
        navbar.classList.add('bg-black/40', 'backdrop-blur-xl');
        navbar.classList.remove('border-transparent');
    } else {
        navbar.classList.remove('bg-black/40', 'backdrop-blur-xl');
        navbar.classList.add('border-transparent');
    }

    const scrollDelta = currentScrollY - lastToggleScrollY;
    if (Math.abs(scrollDelta) < navbarToggleThreshold) {
        return;
    }

    const isScrollingDown = scrollDelta > 0;
    const passedTopArea = currentScrollY > 120;

    if (isScrollingDown && passedTopArea) {
        navbar.classList.add('-translate-y-full');
    } else {
        navbar.classList.remove('-translate-y-full');
    }

    lastToggleScrollY = currentScrollY;
});

// Reserved for future hero widget interactions.
