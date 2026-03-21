// Custom Cursor Logic
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
const interactives = document.querySelectorAll('.interactive');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
const quickBuyName = document.getElementById('quick-buy-name');
const quickBuyCollection = document.getElementById('quick-buy-collection');
const quickBuyPrice = document.getElementById('quick-buy-price');
const quickBuyImage = document.getElementById('quick-buy-image');
const quickBuyTech = document.getElementById('quick-buy-tech');
const quickBuyMobileName = document.getElementById('quick-buy-mobile-name');
const quickBuyMobilePrice = document.getElementById('quick-buy-mobile-price');
const quickBuyCtaDesktop = document.getElementById('quick-buy-cta-desktop');
const quickBuyCtaMobile = document.getElementById('quick-buy-cta-mobile');
const quickBuyCtaDesktopLabel = document.getElementById('quick-buy-cta-desktop-label');
const quickBuyCtaMobileLabel = document.getElementById('quick-buy-cta-mobile-label');
const quickBuyRail = document.querySelector('.quick-buy-rail');
const quickBuyMobile = document.querySelector('.quick-buy-mobile');
const quickBuyCloseDesktop = document.getElementById('quick-buy-close-desktop');
const quickBuyCloseMobile = document.getElementById('quick-buy-close-mobile');
const quickBuySizeButtonsDesktop = document.querySelectorAll('[data-size-option]');
const quickBuySizeButtonsMobile = document.querySelectorAll('[data-size-option-mobile]');
const cartDrawer = document.getElementById('cart-drawer');
const cartDrawerClose = document.getElementById('close-cart-drawer');
const cartDrawerContinue = document.getElementById('continue-shopping');
const cartDrawerImage = document.getElementById('cart-drawer-image');
const cartDrawerName = document.getElementById('cart-drawer-name');
const cartDrawerSize = document.getElementById('cart-drawer-size');
const cartDrawerPrice = document.getElementById('cart-drawer-price');
const cartDrawerSubtotal = document.getElementById('cart-drawer-subtotal');
const fitFinderModal = document.getElementById('fit-finder-modal');
const openFitFinderButton = document.getElementById('open-fit-finder');
const closeFitFinderButton = document.getElementById('close-fit-finder');
const fitFinderForm = document.getElementById('fit-finder-form');
const fitFinderResult = document.getElementById('fit-finder-result');
const fitFinderSize = document.getElementById('fit-finder-size');
const fitFinderConfidence = document.getElementById('fit-finder-confidence');
const applyFitSizeButton = document.getElementById('apply-fit-size');
const featuredDropImage = document.getElementById('featured-drop-image');
const featuredProgressDots = document.querySelectorAll('[data-featured-index]');
const featuredDropTitle = document.getElementById('featured-drop-title');

if (featuredDropImage) {
    const featuredImageShell = featuredDropImage.closest('.hero-image-shell');
    const featuredImageOptions = [
        {
            src: 'images/Lamine.webp',
            alt: 'Lamine featured jersey',
            title: 'AURA Signal Edition'
        },
        {
            src: 'images/Gnabry.png',
            alt: 'Gnabry featured jersey',
            title: 'AURA Phantom Edition'
        }
    ];

    const featuredRotateIntervalMs = 10000;
    const manualAutoRotatePauseMs = 12000;
    const featuredFlipOutDurationMs = 320;
    const featuredFlipInDurationMs = 420;
    let currentFeaturedIndex = 0;
    let pauseAutoRotateUntilMs = 0;
    let featuredFlipInProgress = false;
    let featuredGlowAnimation = null;
    const featuredAssetReadyPromises = new Map();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdMaxTiltDeg = 9;

    let featurePointerActive = false;
    let featurePointerId = null;

    const pauseAutoRotate = () => {
        pauseAutoRotateUntilMs = Date.now() + manualAutoRotatePauseMs;
    };

    const waitForNextFrame = () => new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
    });

    const ensureFeaturedAssetReady = (index) => {
        const image = featuredImageOptions[index];
        if (!image || !image.src) {
            return Promise.resolve();
        }

        const existingPromise = featuredAssetReadyPromises.get(image.src);
        if (existingPromise) {
            return existingPromise;
        }

        const preloadPromise = new Promise((resolve) => {
            const preloadImage = new Image();

            const complete = () => {
                if (typeof preloadImage.decode === 'function') {
                    preloadImage.decode().catch(() => {
                        // Ignore decode failures and proceed with loaded asset.
                    }).finally(resolve);
                    return;
                }

                resolve();
            };

            preloadImage.onload = complete;
            preloadImage.onerror = () => resolve();
            preloadImage.src = image.src;

            if (preloadImage.complete) {
                complete();
            }
        });

        featuredAssetReadyPromises.set(image.src, preloadPromise);
        return preloadPromise;
    };

    const setFeaturedImage = (index) => {
        const image = featuredImageOptions[index];
        featuredDropImage.src = image.src;
        featuredDropImage.alt = image.alt;

        if (featuredDropTitle) {
            featuredDropTitle.textContent = image.title;
        }

        featuredProgressDots.forEach((dot) => {
            const dotIndex = Number(dot.getAttribute('data-featured-index'));
            const isActive = dotIndex === index;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-pressed', String(isActive));
        });
    };

    const runFlipOut = (motionSign) => featuredDropImage.animate([
        {
            transform: 'perspective(1500px) translateX(0px) rotateY(0deg) rotateZ(0deg) scale(1)',
            opacity: 1,
            filter: 'saturate(1) blur(0px)'
        },
        {
            transform: `perspective(1500px) translateX(${10 * motionSign}px) rotateY(${46 * motionSign}deg) rotateZ(${0.25 * motionSign}deg) scale(0.988)`,
            opacity: 0.42,
            filter: 'saturate(1.08) blur(0.7px)'
        },
        {
            transform: `perspective(1500px) translateX(${18 * motionSign}px) rotateY(${82 * motionSign}deg) rotateZ(${0.45 * motionSign}deg) scale(0.958)`,
            opacity: 0.1,
            filter: 'saturate(1.16) blur(2.3px)'
        }
    ], {
        duration: featuredFlipOutDurationMs + 40,
        easing: 'cubic-bezier(0.33, 0, 0.2, 1)',
        fill: 'forwards'
    }).finished;

    const runFlipIn = (motionSign) => featuredDropImage.animate([
        {
            transform: `perspective(1500px) translateX(${-18 * motionSign}px) rotateY(${-82 * motionSign}deg) rotateZ(${-0.45 * motionSign}deg) scale(0.958)`,
            opacity: 0.1,
            filter: 'saturate(1.16) blur(2.3px)'
        },
        {
            transform: `perspective(1500px) translateX(${4 * motionSign}px) rotateY(${12 * motionSign}deg) rotateZ(${0.12 * motionSign}deg) scale(1)`,
            opacity: 0.9,
            filter: 'saturate(1.04) blur(0.2px)'
        },
        {
            transform: 'perspective(1500px) translateX(0px) rotateY(0deg) rotateZ(0deg) scale(1)',
            opacity: 1,
            filter: 'saturate(1) blur(0px)'
        }
    ], {
        duration: featuredFlipInDurationMs + 30,
        easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
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

    const showFeaturedImageByOffset = async (offset, manualTriggered = false) => {
        if (featuredFlipInProgress || featuredImageOptions.length < 2) {
            return;
        }

        if (manualTriggered) {
            pauseAutoRotate();
        }

        featuredFlipInProgress = true;
        try {
            const direction = offset >= 0 ? 1 : -1;
            const motionSign = direction;
            const nextFeaturedIndex = normalizeFeaturedIndex(currentFeaturedIndex + direction);

            await ensureFeaturedAssetReady(nextFeaturedIndex);

            if (prefersReducedMotion) {
                currentFeaturedIndex = nextFeaturedIndex;
                setFeaturedImage(currentFeaturedIndex);
                return;
            }

            runGlowPulse();
            await runFlipOut(motionSign);
            currentFeaturedIndex = nextFeaturedIndex;
            setFeaturedImage(currentFeaturedIndex);
            await waitForNextFrame();
            runChromaticFlash();

            await runFlipIn(motionSign);
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

        featuredImageShell.setPointerCapture(event.pointerId);
        setFeatureShellHoldState(event.clientX, event.clientY);
    };

    const handleFeaturedPointerMove = (event) => {
        if (!featurePointerActive || event.pointerId !== featurePointerId || !featuredImageShell) {
            return;
        }

        setFeatureShellHoldState(event.clientX, event.clientY);
    };

    const handleFeaturedPointerEnd = (event) => {
        if (!featurePointerActive || event.pointerId !== featurePointerId || !featuredImageShell) {
            return;
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

    // Preload and decode featured images so swap direction remains equally smooth.
    featuredImageOptions.forEach((_, index) => {
        void ensureFeaturedAssetReady(index);
    });

    setFeaturedImage(currentFeaturedIndex);
    setFeatureShellRestState();

    featuredDropImage.onerror = () => {
        currentFeaturedIndex = normalizeFeaturedIndex(currentFeaturedIndex + 1);
        setFeaturedImage(currentFeaturedIndex);
    };

    featuredProgressDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const dotIndex = Number(dot.getAttribute('data-featured-index'));
            if (!Number.isInteger(dotIndex) || dotIndex === currentFeaturedIndex) {
                return;
            }

            const nextOffset = dotIndex > currentFeaturedIndex ? 1 : -1;
            showFeaturedImageByOffset(nextOffset, true);
        });
    });

    if (featuredImageShell) {
        featuredImageShell.style.touchAction = 'pan-y';
        featuredImageShell.addEventListener('pointerdown', handleFeaturedPointerDown);
        featuredImageShell.addEventListener('pointermove', handleFeaturedPointerMove);
        featuredImageShell.addEventListener('pointerup', handleFeaturedPointerEnd);
        featuredImageShell.addEventListener('pointercancel', handleFeaturedPointerEnd);
    }

    if (featuredImageOptions.length > 1) {
        window.setInterval(() => {
            if (Date.now() < pauseAutoRotateUntilMs) {
                return;
            }

            showNextFeaturedImage();
        }, featuredRotateIntervalMs);
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

const cards = document.querySelectorAll('.tilt-card');
let selectedQuickBuySize = 'S';
let selectedQuickBuyCard = null;
let latestRecommendedSize = null;
const ctaFeedbackPulseMs = 900;
const quickBuyAutoHideMs = 15000;
let quickBuyAutoHideTimerId = null;

const getProductDataFromCard = (card) => ({
    name: card.getAttribute('data-product-name') || 'Selected Drop',
    price: card.getAttribute('data-product-price') || '$0',
    image: card.getAttribute('data-product-image') || '',
    collection: card.getAttribute('data-product-collection') || 'Drop Collection',
    tech: card.getAttribute('data-product-tech') || 'Advanced Match Fabric'
});

const syncQuickBuySizeButtons = () => {
    quickBuySizeButtonsDesktop.forEach((button) => {
        const size = button.getAttribute('data-size-option');
        button.classList.toggle('is-active', size === selectedQuickBuySize);
    });

    quickBuySizeButtonsMobile.forEach((button) => {
        const size = button.getAttribute('data-size-option-mobile');
        button.classList.toggle('is-active', size === selectedQuickBuySize);
    });
};

const syncQuickBuyCtas = () => {
    if (quickBuyCtaDesktop) {
        const text = `ADD TO BAG - ${selectedQuickBuySize}`;
        if (quickBuyCtaDesktopLabel) {
            quickBuyCtaDesktopLabel.textContent = text;
        } else {
            quickBuyCtaDesktop.textContent = text;
        }
    }

    if (quickBuyCtaMobile) {
        const text = `QUICK BUY - ${selectedQuickBuySize}`;
        if (quickBuyCtaMobileLabel) {
            quickBuyCtaMobileLabel.textContent = text;
        } else {
            quickBuyCtaMobile.textContent = text;
        }
    }
};

const setQuickBuyVisibility = (isVisible) => {
    if (quickBuyRail) {
        quickBuyRail.classList.toggle('is-closed', !isVisible);
        if (!isVisible) {
            quickBuyRail.classList.remove('is-countdown');
        }
    }

    if (quickBuyMobile) {
        quickBuyMobile.classList.toggle('is-closed', !isVisible);
        if (!isVisible) {
            quickBuyMobile.classList.remove('is-countdown');
        }
    }
};

const stopQuickBuyCountdown = () => {
    if (quickBuyAutoHideTimerId) {
        window.clearTimeout(quickBuyAutoHideTimerId);
        quickBuyAutoHideTimerId = null;
    }

    if (quickBuyRail) {
        quickBuyRail.classList.remove('is-countdown');
    }

    if (quickBuyMobile) {
        quickBuyMobile.classList.remove('is-countdown');
    }
};

const startQuickBuyCountdown = () => {
    stopQuickBuyCountdown();

    if (quickBuyRail && !quickBuyRail.classList.contains('is-closed')) {
        void quickBuyRail.offsetWidth;
        quickBuyRail.classList.add('is-countdown');
    }

    if (quickBuyMobile && !quickBuyMobile.classList.contains('is-closed')) {
        void quickBuyMobile.offsetWidth;
        quickBuyMobile.classList.add('is-countdown');
    }

    quickBuyAutoHideTimerId = window.setTimeout(() => {
        clearSelectedCard();
    }, quickBuyAutoHideMs);
};

const setQuickBuySize = (size) => {
    selectedQuickBuySize = size;
    syncQuickBuySizeButtons();
    syncQuickBuyCtas();
};

const setQuickBuyProduct = (card) => {
    selectedQuickBuyCard = card;
    const data = getProductDataFromCard(card);

    cards.forEach((currentCard) => {
        currentCard.classList.toggle('is-selected', currentCard === card);
    });

    setQuickBuyVisibility(true);

    if (quickBuyName) {
        quickBuyName.textContent = data.name;
    }

    if (quickBuyCollection) {
        quickBuyCollection.textContent = data.collection;
    }

    if (quickBuyPrice) {
        quickBuyPrice.textContent = data.price;
    }

    if (quickBuyImage && data.image) {
        quickBuyImage.src = data.image;
        quickBuyImage.alt = `${data.name} jersey`;
    }

    if (quickBuyTech) {
        quickBuyTech.textContent = `Tech: ${data.tech}`;
    }

    if (quickBuyMobileName) {
        quickBuyMobileName.textContent = data.name;
    }

    if (quickBuyMobilePrice) {
        quickBuyMobilePrice.textContent = data.price;
    }

    startQuickBuyCountdown();
};

const clearSelectedCard = () => {
    stopQuickBuyCountdown();
    selectedQuickBuyCard = null;
    cards.forEach((card) => {
        card.classList.remove('is-selected');
    });
    setQuickBuyVisibility(false);
};

const openCartDrawer = () => {
    if (!cartDrawer) {
        return;
    }

    const activeData = selectedQuickBuyCard
        ? getProductDataFromCard(selectedQuickBuyCard)
        : null;

    if (activeData) {
        if (cartDrawerImage && activeData.image) {
            cartDrawerImage.src = activeData.image;
            cartDrawerImage.alt = `${activeData.name} jersey`;
        }

        if (cartDrawerName) {
            cartDrawerName.textContent = activeData.name;
        }

        if (cartDrawerPrice) {
            cartDrawerPrice.textContent = activeData.price;
        }

        if (cartDrawerSubtotal) {
            cartDrawerSubtotal.textContent = activeData.price;
        }
    }

    if (cartDrawerSize) {
        cartDrawerSize.textContent = `Size ${selectedQuickBuySize}`;
    }

    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
};

const closeCartDrawer = () => {
    if (!cartDrawer) {
        return;
    }

    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
};

const triggerAddedToBagFeedback = (button, defaultLabel, onDone) => {
    if (!button) {
        return;
    }

    const buttonLabel = button === quickBuyCtaDesktop
        ? quickBuyCtaDesktopLabel
        : button === quickBuyCtaMobile
            ? quickBuyCtaMobileLabel
            : null;

    button.classList.remove('cta-pulse-success');
    void button.offsetWidth;
    button.classList.add('cta-pulse-success');
    if (buttonLabel) {
        buttonLabel.textContent = 'ADDED TO BAG';
    } else {
        button.textContent = 'ADDED TO BAG';
    }

    window.setTimeout(() => {
        button.classList.remove('cta-pulse-success');
        if (buttonLabel) {
            buttonLabel.textContent = defaultLabel;
        } else {
            button.textContent = defaultLabel;
        }
        if (onDone) {
            onDone();
        }
    }, ctaFeedbackPulseMs);
};

const openFitFinder = () => {
    if (!fitFinderModal) {
        return;
    }

    fitFinderModal.classList.remove('is-hidden');
    fitFinderModal.setAttribute('aria-hidden', 'false');
};

const closeFitFinder = () => {
    if (!fitFinderModal) {
        return;
    }

    fitFinderModal.classList.add('is-hidden');
    fitFinderModal.setAttribute('aria-hidden', 'true');
};

const clampSizeIndex = (value) => Math.max(0, Math.min(3, value));

const calculateRecommendedSize = (height, weight, fitPreference) => {
    const sizes = ['S', 'M', 'L', 'XL'];
    let index = 1;

    if (height < 168 || weight < 60) {
        index = 0;
    } else if (height >= 185 || weight >= 85) {
        index = 2;
    }

    if (height >= 195 || weight >= 100) {
        index = 3;
    }

    if (fitPreference === 'slim') {
        index = clampSizeIndex(index - 1);
    } else if (fitPreference === 'oversized') {
        index = clampSizeIndex(index + 1);
    }

    const confidence = (height >= 150 && height <= 200 && weight >= 45 && weight <= 110)
        ? 'High confidence'
        : 'Medium confidence';

    return { size: sizes[index], confidence };
};

quickBuySizeButtonsDesktop.forEach((button) => {
    button.addEventListener('click', () => {
        const size = button.getAttribute('data-size-option');
        if (size) {
            setQuickBuySize(size);
        }
    });
});

quickBuySizeButtonsMobile.forEach((button) => {
    button.addEventListener('click', () => {
        const size = button.getAttribute('data-size-option-mobile');
        if (size) {
            setQuickBuySize(size);
        }
    });
});

if (cards.length > 0) {
    setQuickBuyProduct(cards[0]);
    setQuickBuySize(selectedQuickBuySize);
}

if (quickBuyCloseDesktop) {
    quickBuyCloseDesktop.addEventListener('click', () => {
        clearSelectedCard();
    });
}

if (quickBuyCloseMobile) {
    quickBuyCloseMobile.addEventListener('click', () => {
        clearSelectedCard();
    });
}

if (quickBuyCtaDesktop) {
    quickBuyCtaDesktop.addEventListener('click', () => {
        triggerAddedToBagFeedback(
            quickBuyCtaDesktop,
            `ADD TO BAG - ${selectedQuickBuySize}`,
            openCartDrawer
        );
    });
}

if (quickBuyCtaMobile) {
    quickBuyCtaMobile.addEventListener('click', () => {
        triggerAddedToBagFeedback(
            quickBuyCtaMobile,
            `QUICK BUY - ${selectedQuickBuySize}`,
            openCartDrawer
        );
    });
}

if (cartDrawerClose) {
    cartDrawerClose.addEventListener('click', closeCartDrawer);
}

if (cartDrawerContinue) {
    cartDrawerContinue.addEventListener('click', closeCartDrawer);
}

if (cartDrawer) {
    cartDrawer.addEventListener('click', (event) => {
        if (event.target === cartDrawer) {
            closeCartDrawer();
        }
    });
}

if (openFitFinderButton) {
    openFitFinderButton.addEventListener('click', openFitFinder);
}

if (closeFitFinderButton) {
    closeFitFinderButton.addEventListener('click', closeFitFinder);
}

if (fitFinderModal) {
    fitFinderModal.addEventListener('click', (event) => {
        if (event.target === fitFinderModal) {
            closeFitFinder();
        }
    });
}

if (fitFinderForm) {
    fitFinderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(fitFinderForm);
        const height = Number(formData.get('height'));
        const weight = Number(formData.get('weight'));
        const fitPreference = String(formData.get('fitPreference') || 'regular');

        const recommendation = calculateRecommendedSize(height, weight, fitPreference);
        latestRecommendedSize = recommendation.size;

        if (fitFinderSize) {
            fitFinderSize.textContent = recommendation.size;
        }

        if (fitFinderConfidence) {
            fitFinderConfidence.textContent = recommendation.confidence;
        }

        if (fitFinderResult) {
            fitFinderResult.classList.remove('hidden');
        }
    });
}

if (applyFitSizeButton) {
    applyFitSizeButton.addEventListener('click', () => {
        if (!latestRecommendedSize) {
            return;
        }

        setQuickBuySize(latestRecommendedSize);
        closeFitFinder();
    });
}

// 3D Magnetic Tilt Effect for Product Cards

cards.forEach((card) => {
    card.addEventListener('click', () => {
        setQuickBuyProduct(card);
    });

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
