/* =========================================
   STRONG CONTENT PROTECTION SYSTEM
   Blocks: Right-click, F12, Ctrl+U, Ctrl+S, etc.
   ========================================= */
(function () {
    // 1. Disable Right Click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, etc.)
    document.addEventListener('keydown', e => {
        // Disable F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+Shift+I (Inspect), J (Console), C (Element Select)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+S (Save), Ctrl+P (Print)
        if (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 80)) {
            e.preventDefault();
            return false;
        }
        // Disable Ctrl+C / Ctrl+V (Optional but requested)
        if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86)) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Disable Image Dragging & Text Selection Start
    document.addEventListener('dragstart', e => {
        if (e.target.nodeName === 'IMG') e.preventDefault();
    });
    document.addEventListener('selectstart', e => e.preventDefault());

    // 4. Subtle Print Shield
    window.addEventListener('beforeprint', () => {
        document.body.style.display = 'none';
        setTimeout(() => document.body.style.display = 'block', 100);
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    // Side Menu Toggle & Rocket Logic
    const menuBtn = document.querySelector('.side-menu-btn');
    const navWrapper = document.querySelector('.side-nav-wrapper');
    const rocketArrow = document.querySelector('.side-nav-wrapper .btn-arrow');
    const navItems = document.querySelectorAll('.side-nav-item');

    if (menuBtn && navWrapper) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navWrapper.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!navWrapper.contains(e.target) && navWrapper.classList.contains('active')) {
                navWrapper.classList.remove('active');
            }
        });
    }

    // Slider Logic (Dynamic)
    async function loadHeroSlides() {
        const sliderTrack = document.querySelector('.slider');
        if (!sliderTrack) return;

        // Wait for Firebase
        if (!window.db) {
            let attempts = 0;
            while (!window.db && attempts < 50) { await new Promise(r => setTimeout(r, 100)); attempts++; }
        }

        if (!window.db) return;

        try {
            const querySnapshot = await window.getDocs(window.collection(window.db, "index_hero"));
            const dotsContainer = document.querySelector('.slider-dots');

            if (!querySnapshot.empty) {
                sliderTrack.innerHTML = '';
                if (dotsContainer) dotsContainer.innerHTML = '';

                let index = 0;
                querySnapshot.forEach((doc) => {
                    const s = doc.data();
                    const activeClass = index === 0 ? 'active' : '';

                    // Handling link: check if it's just an ID or full URL
                    let watchLink = s.link || '#';
                    if (!watchLink.includes('http') && !watchLink.includes('.html')) {
                        watchLink = `post.html?id=${watchLink}`;
                    }

                    const slideHTML = `
                    <div class="slide ${activeClass}" style="background-image: url('${s.backdrop}');">
                        <div class="overlay"></div>
                        <div class="container slide-content">
                            <div class="hero-info-stack">
                                ${s.logo ? `<img src="${s.logo}" alt="Title Logo" class="slide-logo">` : ''}
                                <div class="slide-meta">
                                    <span class="age-rating">${s.ageRating || 'N/A'}</span>
                                    <span class="meta-sep">♦</span>
                                    <span class="meta-item">${s.quality || 'HD'}</span>
                                    <span class="meta-sep">♦</span>
                                    <span class="meta-item">${s.tags || ''}</span>
                                </div>
                            </div>
                            <div class="slide-btns">
                                <a href="${watchLink}" class="btn btn-primary"><i class="fas fa-play"></i> Watch Now</a>
                                <a href="${watchLink}" class="btn btn-secondary"><i class="fas fa-info-circle"></i> Details</a>
                            </div>
                        </div>
                    </div>`;
                    sliderTrack.insertAdjacentHTML('beforeend', slideHTML);

                    if (dotsContainer) {
                        const dot = document.createElement('span');
                        dot.className = `dot ${activeClass}`;
                        dot.setAttribute('data-index', index);
                        dotsContainer.appendChild(dot);
                    }
                    index++;
                });
            }

            initSlider();

        } catch (error) {
            console.error("Error loading hero slides:", error);
        }
    }

    function initSlider() {
        const sliderTrack = document.querySelector('.slider');
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.prev-slide');
        const nextBtn = document.querySelector('.next-slide');

        if (sliderTrack && slides.length > 0) {
            let currentSlide = 0;
            const slideCount = slides.length;
            let slideInterval;

            function goToSlide(n) {
                currentSlide = (n + slideCount) % slideCount;
                sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
                dots.forEach(dot => dot.classList.remove('active'));
                if (dots[currentSlide]) dots[currentSlide].classList.add('active');
                slides.forEach(slide => slide.classList.remove('active'));
                slides[currentSlide].classList.add('active');
            }

            function nextSlide() { goToSlide(currentSlide + 1); }
            function prevSlide() { goToSlide(currentSlide - 1); }

            // Clean up old listeners if re-initializing (simple way: clone node, but here simple assignment is ok for new elements)
            // But prevBtn/nextBtn are static, so we should be careful not to duplicate listeners if run twice. 
            // For now assuming run once.

            if (nextBtn) {
                const newNext = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newNext, nextBtn);
                newNext.addEventListener('click', () => { nextSlide(); resetTimer(); });
            }
            if (prevBtn) {
                const newPrev = prevBtn.cloneNode(true);
                prevBtn.parentNode.replaceChild(newPrev, prevBtn);
                newPrev.addEventListener('click', () => { prevSlide(); resetTimer(); });
            }

            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const index = parseInt(dot.getAttribute('data-index'));
                    goToSlide(index);
                    resetTimer();
                });
            });

            function startTimer() { slideInterval = setInterval(nextSlide, 5000); }
            function resetTimer() { clearInterval(slideInterval); startTimer(); }
            startTimer();
        }
    }

    loadHeroSlides();



    // Rocket Rotation
    if (rocketArrow && navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const angle = item.getAttribute('data-angle');
                if (angle) rocketArrow.style.transform = `rotate(${angle}deg)`;
            });
            item.addEventListener('mouseleave', () => {
                rocketArrow.style.transform = 'rotate(45deg)';
            });
        });
    }

    // Theme Toggle Logic (Dynamic Firebase-Backed)
    const cord = document.getElementById('themeCord');
    const hint = document.getElementById('bulbHint');
    let activeThemes = ['dark', 'light', 'christmas', 'ruby', 'amethyst', 'winter', 'festival', 'halloween', 'spring']; // Default fallback
    let hintTimeout;

    const themeNames = {
        'dark': 'Dark Mode',
        'light': 'Light Mode',
        'christmas': 'Christmas Mode',
        'ruby': 'Ruby Mode',
        'amethyst': 'Amethyst Mode',
        'winter': 'Winter Mode',
        'festival': 'Festival Mode',
        'halloween': 'Halloween Mode',
        'spring': 'Spring Mode'
    };

    // Helper to get current mode
    function getCurrentMode() {
        return document.documentElement.getAttribute('data-theme') || 'ruby';
    }

    // Helper to set mode
    function setMode(mode) {
        if (mode === 'dark') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', mode);
        }
        localStorage.setItem('theme', mode);
        updateHint();
    }

    // Helper to update hint text based on NEXT mode
    function updateHint() {
        if (!hint) return;
        const current = getCurrentMode();
        const currentIndex = activeThemes.indexOf(current);
        // If current theme not in cycle (e.g. disabled), default to first next or 0
        const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % activeThemes.length;
        const nextTheme = activeThemes[nextIndex];

        let nextThemeName = themeNames[nextTheme] || 'Mode';
        if (nextTheme === 'christmas') nextThemeName = 'Christmas 🎄';
        if (nextTheme === 'ruby') nextThemeName = 'Ruby 💎';
        if (nextTheme === 'amethyst') nextThemeName = 'Amethyst 🔮';
        if (nextTheme === 'winter') nextThemeName = 'Winter ❄️';
        if (nextTheme === 'festival') nextThemeName = 'Festival 🪔';
        if (nextTheme === 'halloween') nextThemeName = 'Halloween 🎃';
        if (nextTheme === 'spring') nextThemeName = 'Spring 🌸';

        hint.textContent = `Use me for ${nextThemeName}`;
    }

    // Init Theme System
    async function initThemes() {
        // 1. Load Stored Theme immediately (visuals first)
        const stored = localStorage.getItem('theme') || 'dark';
        if (stored !== 'dark') {
            document.documentElement.setAttribute('data-theme', stored);
        }

        // 2. Load Config from Firebase
        // Helper to wait for DB
        const waitForDB = async () => {
            let attempts = 0;
            while (!window.db && attempts < 50) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            return window.db;
        };

        if (await waitForDB()) {
            try {
                const docSnap = await window.getDoc(window.doc(window.db, "settings", "theme"));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const newActive = ['dark']; // Always include dark
                    if (data.light !== false) newActive.push('light');
                    if (data.christmas) newActive.push('christmas');
                    if (data.ruby) newActive.push('ruby');
                    if (data.amethyst) newActive.push('amethyst');
                    if (data.winter) newActive.push('winter');
                    if (data.festival) newActive.push('festival');
                    if (data.halloween) newActive.push('halloween');
                    if (data.spring) newActive.push('spring');

                    if (newActive.length >= 2) {
                        activeThemes = newActive;
                        console.log('🎨 Active Themes Loaded:', activeThemes);
                    }
                }
            } catch (e) {
                console.error("Theme config load error:", e);
            }
        }

        updateHint();
    }

    // Event Listener
    if (cord) {
        cord.addEventListener('click', () => {
            const current = getCurrentMode();
            let currentIndex = activeThemes.indexOf(current);

            // If current theme is somehow not in the active list start cycle from 0 (Dark)
            if (currentIndex === -1) currentIndex = -1;

            const nextIndex = (currentIndex + 1) % activeThemes.length;
            const nextTheme = activeThemes[nextIndex];

            setMode(nextTheme);

            // Animations
            const container = document.querySelector('.bulb-container');
            container.style.animation = 'none';
            container.offsetHeight; /* trigger reflow */
            container.style.animation = 'swing 3s infinite ease-in-out alternate';

            if (hint) {
                hint.classList.add('show');
                clearTimeout(hintTimeout);
                hintTimeout = setTimeout(() => {
                    hint.classList.remove('show');
                }, 4000);
            }
        });
    }

    initThemes();

    // Hint Interval Logic

    if (hint) {
        // Function to show hint temporarily
        function showHintBriefly() {
            hint.classList.add('show');
            clearTimeout(hintTimeout); // Clear any existing close timer
            hintTimeout = setTimeout(() => {
                hint.classList.remove('show');
            }, 4000); // Visible for 4 seconds
        }

        // Show initially after 2 seconds
        setTimeout(showHintBriefly, 2000);

        // Then every 30 seconds
        setInterval(showHintBriefly, 30000);
    }

    // --- Pagination Logic ---
    const cardsPerPage = 24;
    const movieGrid = document.querySelector('.movie-grid');
    const paginationControlsTop = document.getElementById('paginationControls');
    const paginationControlsBottom = document.getElementById('paginationControlsBottom');

    let allMovies = [];
    let filteredMovies = [];
    let currentPage = 1;

    // Fetch and Initialize Data
    async function loadIndexData() {
        if (!movieGrid) return; // Only on pages with a grid

        try {
            // Wait for Firebase
            if (!window.db || !window.collection) {
                console.log("Waiting for Firebase...");
                let attempts = 0;
                while ((!window.db || !window.collection) && attempts < 100) { await new Promise(r => setTimeout(r, 100)); attempts++; }
                if (!window.db || !window.collection) console.error("Firebase timeout!");
                else console.log("Firebase loaded!");
            }

            const querySnapshot = await window.getDocs(window.collection(window.db, "posts"));
            const posts = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            // Render Platform Buttons (Browse by Platform)
            loadPlatformButtons(posts);

            allMovies = posts.map((post, index) => {
                // Extract useful data safely
                let rating = "N/A";
                let year = "2024";
                let format = "TV Series";

                if (post.seasons && post.seasons.length > 0) {
                    // Try to find the best rating among seasons or just take the first valid one
                    // For now taking the first one or iterating if needed.
                    // A simple approach: take the max rating found in any season.
                    let maxRating = 0;
                    let hasRating = false;
                    post.seasons.forEach(s => {
                        if (s.overview && s.overview.rating && s.overview.rating !== "--" && s.overview.rating !== "N/A") {
                            const r = parseFloat(s.overview.rating);
                            if (!isNaN(r) && r > maxRating) {
                                maxRating = r;
                                hasRating = true;
                            }
                        }
                    });
                    if (hasRating) rating = maxRating.toString();

                    if (post.seasons[0].overview) {
                        year = post.seasons[0].overview.episodes || "2024"; // Fallback to episodes if year not found (logic from old code)
                        format = post.seasons[0].overview.format || "TV Series";
                    }
                }

                return {
                    id: post.id || index.toString(),
                    serial: post.id || (index + 1).toString(),
                    title: post.title,
                    image: post.hero.poster,
                    backdrop: post.hero.backdrop, // Added backdrop
                    rating: rating,
                    quality: "HD",
                    year: post.cardBadgeLeft || year,
                    format: post.cardBadgeRight || format,
                    ppt: post.ppt,
                    platforms: post.platforms
                };
            });

            // check if we are on IMDb page
            if (document.body.classList.contains('imdb-page')) {
                // Sort by Rating Descending
                allMovies.sort((a, b) => {
                    const rA = parseFloat(a.rating) || 0;
                    const rB = parseFloat(b.rating) || 0;
                    return rB - rA;
                });

                // Re-assign serials based on rank
                allMovies.forEach((m, i) => m.serial = i + 1);
            } else {
                // Default View: Sort by ID descending (Latest First)
                allMovies.sort((a, b) => parseInt(b.id) - parseInt(a.id));

                // Optional: If you want serial numbers to always be 1, 2, 3... based on current order
                // even after sort, uncomment the next line:
                // allMovies.forEach((m, i) => m.serial = i + 1);
            }

            // Initial Filter & Render
            filteredMovies = [...allMovies];
            renderPage(1);

        } catch (error) {
            console.error('Error loading index data:', error);
            // Optionally show error in grid
            movieGrid.innerHTML = '<p style="color:var(--text-grey); width:100%; text-align:center;">Failed to load content.</p>';
        }
    }

    // Call init
    loadIndexData();

    // Load Platform Buttons Logic
    function loadPlatformButtons(posts) {
        const platformGrid = document.getElementById('platformGrid');
        if (!platformGrid) return;

        const counts = {};
        const platformDisplayNames = {
            'crunchyroll': 'Crunchyroll',
            'netflix': 'Netflix',
            'prime': 'Prime Video', // User prefers 'Prime Video' label
            'primevideo': 'Prime Video',
            'hulu': 'Hulu',
            'hotstar': 'Disney+ Hotstar',
            'sonyliv': 'Sony LIV',
            'jiocinema': 'Jio Cinema',
            'zee5': 'Zee5',
            'aha': 'Aha',
            'sunnxt': 'Sun NXT'
        };

        posts.forEach(post => {
            const uniquePlatforms = new Set();

            // 1. Check ppt
            if (post.ppt) uniquePlatforms.add(post.ppt.toLowerCase().trim());

            // 2. Check platforms array
            if (post.platforms && Array.isArray(post.platforms)) {
                post.platforms.forEach(p => {
                    if (p.class) uniquePlatforms.add(p.class.toLowerCase().trim());
                    else if (p.name) uniquePlatforms.add(p.name.toLowerCase().replace(/\s+/g, ''));
                });
            }

            uniquePlatforms.forEach(key => {
                let normalized = key;
                // Normalization mappings
                if (key === 'primevideo') normalized = 'prime';
                if (key === 'disney+hotstar') normalized = 'hotstar';

                counts[normalized] = (counts[normalized] || 0) + 1;
            });
        });

        platformGrid.innerHTML = '';

        // Sort keys to have major platforms first if needed, or just alphabetical/count based
        // For now, Object.keys iteration.
        Object.keys(counts).forEach(key => {
            let displayName = platformDisplayNames[key];
            if (!displayName) {
                // Capitalize fallback
                displayName = key.charAt(0).toUpperCase() + key.slice(1);
            }

            const count = counts[key].toString().padStart(2, '0');

            const pill = document.createElement('div');
            pill.className = 'platform-pill';
            pill.innerHTML = `
                <span class="platform-name">${displayName}</span>
                <span class="platform-count-badge">${count}</span>
            `;

            pill.addEventListener('click', () => {
                // Toggle Logic
                if (pill.classList.contains('active')) {
                    // Deactivate
                    pill.classList.remove('active');
                    filteredMovies = [...allMovies];
                } else {
                    // Remove active from others
                    document.querySelectorAll('.platform-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');

                    // Filter
                    const filterKey = key; // The normalized key from loop
                    filteredMovies = allMovies.filter(m => {
                        // Check ppt
                        if (m.ppt && m.ppt.toLowerCase().trim() === filterKey) return true;

                        // Check platforms array
                        if (m.platforms && Array.isArray(m.platforms)) {
                            return m.platforms.some(p => {
                                let pKey = '';
                                if (p.class) pKey = p.class.toLowerCase().trim();
                                else if (p.name) pKey = p.name.toLowerCase().replace(/\s+/g, '');

                                // Normalize pKey
                                if (pKey === 'primevideo') pKey = 'prime';
                                if (pKey === 'disney+hotstar') pKey = 'hotstar';

                                return pKey === filterKey;
                            });
                        }
                        return false;
                    });
                }
                currentPage = 1;
                renderPage(1);

                // Scroll to results
                const featuredSection = document.getElementById('featured');
                if (featuredSection) featuredSection.scrollIntoView({ behavior: 'smooth' });
            });
            platformGrid.appendChild(pill);
        });
    }


    // Search Elements
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    function filterMovies(query) {
        if (!query) {
            filteredMovies = [...allMovies];
        } else {
            const lowerQuery = query.toLowerCase();
            filteredMovies = allMovies.filter(movie =>
                movie.title.toLowerCase().includes(lowerQuery)
            );
        }
        currentPage = 1; // Reset to first page
        renderPage(currentPage);
    }

    // Search Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterMovies(e.target.value);
        });

        // Also handle Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterMovies(searchInput.value);
            }
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            filterMovies(searchInput.value);
        });
    }

    function renderPage(page) {
        if (!movieGrid) return;
        movieGrid.innerHTML = '';

        const start = (page - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const pageItems = filteredMovies.slice(start, end);

        if (pageItems.length === 0) {
            movieGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-grey);">No results found</div>';
            updatePaginationUI(paginationControlsTop);
            updatePaginationUI(paginationControlsBottom);
            return;
        }

        // Check if IMDb Page
        const isImdbPage = document.body.classList.contains('imdb-page');

        if (isImdbPage) {
            // Add list view class to container
            movieGrid.classList.add('imdb-list-view');
            movieGrid.classList.remove('movie-grid'); // Remove grid layout styles if they conflict (or just override)
            // Note: removing movie-grid might break some selectors if they depend on it. 
            // In CSS we might have .movie-grid { display: grid; ... }
            // Let's Just keep .movie-grid but override display with .imdb-list-view from CSS
        }

        pageItems.forEach(movie => {
            if (isImdbPage) {
                // Render List Item
                const item = document.createElement('a');
                item.href = `post.html?id=${movie.id}`;
                item.className = 'imdb-item';

                // Format Rank: 01, 02...
                const rank = movie.serial < 10 ? `0${movie.serial}` : movie.serial;

                item.innerHTML = `
                    <div class="img-wrapper" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:0;">
                         <img class="imdb-bg-image" src="${movie.backdrop || movie.image}" alt="${movie.title}" loading="lazy">
                    </div>
                    <div class="imdb-overlay"></div>
                    
                    <div class="rank-circle-wrapper">
                        <div class="rank-circle">${rank}</div>
                    </div>
                    
                    <div class="imdb-content">
                        <h3 class="imdb-title">${movie.title}</h3>
                    </div>

                    <div class="rating-badge-wrapper">
                        <div class="rating-pill">
                            <span class="rating-score">${movie.rating}</span>
                            <div class="rating-sub">
                                <span class="imdb-logo">IMDb</span>
                                <span>/10</span>
                            </div>
                        </div>
                    </div>
                `;
                movieGrid.appendChild(item);

            } else {
                // Render Standard Grid Card
                const card = document.createElement('article');
                card.className = 'movie-card';
                // Connect to post page
                card.style.cursor = 'pointer';
                card.onclick = () => window.location.href = `post.html?id=${movie.id}`;

                card.innerHTML = `
                    <div class="poster-wrapper">
                        <img src="${movie.image}" alt="${movie.title}" loading="lazy">
                        <div class="card-overlay">
                            <button class="play-btn"><i class="fas fa-play"></i></button>
                        </div>
                        <span class="rating-badge"><i class="fas fa-star"></i> ${movie.rating}</span>
                        <span class="serial-badge">#${movie.serial}</span>
                    </div>
                    <div class="card-info">
                        <h3>${movie.title}</h3>
                        <div class="card-tags">
                            <span class="tag-year">${movie.year}</span>
                            <span class="tag-season">${movie.format}</span>
                        </div>
                    </div>
                `;
                movieGrid.appendChild(card);
            }
        });

        // Trigger Face Detection if on IMDb Page
        if (isImdbPage) {
            setTimeout(detectFaces, 500);
        }

        // Update BOTH controls
        updatePaginationUI(paginationControlsTop);
        updatePaginationUI(paginationControlsBottom);
    }

    /* --- SmartCrop Face Detection Logic --- */
    function detectFaces() {
        if (typeof SmartCrop === 'undefined') return;

        const images = document.querySelectorAll('img.imdb-bg-image');
        images.forEach(img => {
            // Processing
            if (img.complete && img.naturalWidth > 0) {
                runSmartCrop(img);
            } else {
                img.onload = () => runSmartCrop(img);
            }
        });
    }

    function runSmartCrop(img) {
        // We crop to the dimensions of the container (e.g. 900x120 roughly)
        const width = 900;
        const height = 120;

        // Create a new image for analysis to attempt CORS fetch without affecting UI
        const analyzeImg = new Image();
        analyzeImg.crossOrigin = "Anonymous";
        analyzeImg.src = img.src;

        analyzeImg.onload = function () {
            SmartCrop.crop(analyzeImg, { width: width, height: height }).then(function (result) {
                if (result && result.topCrop) {
                    const crop = result.topCrop;
                    const centerX = crop.x + (crop.width / 2);
                    const centerY = crop.y + (crop.height / 2);

                    const percentX = (centerX / analyzeImg.naturalWidth) * 100;
                    const percentY = (centerY / analyzeImg.naturalHeight) * 100;

                    img.style.objectPosition = `${percentX.toFixed(1)}% ${percentY.toFixed(1)}%`;
                }
            }).catch(err => {
                // CORS or other error, ignore
                console.log("SmartCrop analysis skipped (CORS/Error)");
            });
        };

        analyzeImg.onerror = function () {
            // CORS might be blocked completely
        };
    }

    function updatePaginationUI(container) {
        if (!container) return;
        container.innerHTML = '';

        const totalPages = Math.ceil(filteredMovies.length / cardsPerPage);

        if (totalPages <= 1 && filteredMovies.length > 0) {
            // Force show pagination for single page to confirm UI exists (User Request)
            // But usually we hide it. Let's keep it visible but maybe minimal?
            // Actually, if strictly adhering to "add pagination", showing "Page 1" matches expectations.
        } else if (totalPages === 0) {
            return;
        }

        const isNewDesign = document.body.classList.contains('imdb-page');
        const btnClass = isNewDesign ? 'page-btn-new' : 'page-btn';

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.className = btnClass;
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
                const targetId = isNewDesign ? 'paginationControls' : 'featured';
                // If top controls exist, scroll there, else top of section
                const target = document.getElementById(targetId) || document.querySelector('.featured-section');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        container.appendChild(prevBtn);

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `${btnClass} ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderPage(currentPage);
                const targetId = isNewDesign ? 'paginationControls' : 'featured';
                const target = document.getElementById(targetId) || document.querySelector('.featured-section');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
            container.appendChild(btn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = btnClass;
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
                const targetId = isNewDesign ? 'paginationControls' : 'featured';
                const target = document.getElementById(targetId) || document.querySelector('.featured-section');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        container.appendChild(nextBtn);
    }

    // Initial Render
    if (movieGrid) {
        renderPage(currentPage);
    }

    /* --- Media Tab Logic --- */
    window.switchMedia = function (event, targetId) {
        // 1. Remove active class from all tabs
        const tabs = document.querySelectorAll('.media-tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        // 2. Add active class to clicked tab
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }

        // 3. Hide all media galleries
        const galleries = document.querySelectorAll('.media-gallery');
        galleries.forEach(gallery => {
            gallery.style.display = 'none';
            gallery.classList.remove('active');
        });

        // 4. Show the target gallery
        const target = document.getElementById(targetId);
        if (target) {
            target.style.display = 'grid'; // Ensure grid display is restored
            setTimeout(() => target.classList.add('active'), 10);
        }
    };

    /* --- Season Selector Logic --- */
    window.switchSeason = function (event, seasonId) {
        // Update Tabs
        const tabs = document.querySelectorAll('.season-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }

        // Update Panels
        const panels = document.querySelectorAll('.season-panel');
        panels.forEach(panel => {
            panel.classList.remove('active'); // Hide all
            panel.style.display = 'none'; // Ensure display none

            if (panel.id === seasonId) {
                panel.style.display = 'block';
                // Small timeout to allow display:block to apply before opacity transition
                setTimeout(() => panel.classList.add('active'), 10);
            }
        });
    };

    // Initialize first season active state correctly ensuring display block
    const firstSeason = document.getElementById('season-1');
    if (firstSeason) {
        firstSeason.style.display = 'block';
        setTimeout(() => firstSeason.classList.add('active'), 10);
    }

    /* --- Cast Modal Logic --- */
    window.openCastModal = function (element) {
        const modal = document.getElementById('castModal');

        // Data Extraction
        const artist = element.getAttribute('data-artist');
        const role = element.getAttribute('data-role');
        const artistImg = element.getAttribute('data-artist-img');
        const charName = element.getAttribute('data-char');
        const seasons = element.getAttribute('data-seasons');
        const year = element.getAttribute('data-year');
        const platform = element.getAttribute('data-platform');

        // Get Anime Title (Dynamic)
        const animeTitle = document.title.split('-')[0].trim();

        // Population
        document.getElementById('m_artistName').textContent = artist;
        document.getElementById('m_role').textContent = role;
        document.getElementById('m_artistImg').src = artistImg;
        document.getElementById('m_charName').textContent = charName;
        document.getElementById('m_animeTitle').textContent = animeTitle;
        document.getElementById('m_seasons').textContent = seasons;
        document.getElementById('m_year').textContent = year;
        document.getElementById('m_platform').textContent = platform;

        // Show
        modal.style.display = 'flex';
        // Small timeout for opacity transition
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Stop body scroll
        document.body.style.overflow = 'hidden';
    };

    window.closeCastModal = function (event) {
        // If event is provided (click on overlay), check target
        if (event && event.target !== event.currentTarget && !event.target.classList.contains('modal-close')) return;

        const modal = document.getElementById('castModal');
        modal.classList.remove('active');

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };
});


/* --- 3D Manga Book Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('mangaBook');
    const pages = document.querySelectorAll('.manga-page');
    const dots = document.querySelectorAll('.prog-dot');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (!book) return;

    let currentPage = 1;
    const totalPages = pages.length;

    function updateBook(targetPage) {
        if (targetPage < 1 || targetPage > totalPages) return;

        // Update Pages
        pages.forEach((page, index) => {
            const pageNum = index + 1;
            page.classList.remove('active', 'flipped');

            if (pageNum < targetPage) {
                page.classList.add('flipped');
            } else if (pageNum === targetPage) {
                page.classList.add('active');
            }
        });

        // Update Dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', (index + 1) === targetPage);
        });

        currentPage = targetPage;
    }

    nextBtn?.addEventListener('click', () => {
        if (currentPage < totalPages) updateBook(currentPage + 1);
    });

    prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) updateBook(currentPage - 1);
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = parseInt(dot.getAttribute('data-go'));
            updateBook(target);
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'ArrowLeft') prevBtn.click();
    });
});


/* --- Countdown Timer Logic (Season 2) --- */
function startCountdown() {
    // ... existing season 2 logic ...
    // NOTE: In a real refactor, we would make this function reusable with parameters.
    const now = new Date();
    const countDownDate = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000) + (13 * 60 * 1000)).getTime();

    const timerInterval = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dEl = document.getElementById("d");
        const hEl = document.getElementById("h");
        const mEl = document.getElementById("m");
        const sEl = document.getElementById("s");

        if (dEl) dEl.innerText = days < 10 ? "0" + days : days;
        if (hEl) hEl.innerText = hours < 10 ? "0" + hours : hours;
        if (mEl) mEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        if (sEl) sEl.innerText = seconds < 10 ? "0" + seconds : seconds;

        if (distance < 0) {
            clearInterval(timerInterval);
            if (dEl) document.querySelector("#season2-timer").innerHTML = "<div class='episode-info'>EPISODE RELEASED!</div>";
        }
    }, 1000);
}

/* --- Countdown Timer Logic (Season 3 Ongoing) --- */
function startCountdownSeason3() {
    // Next episode in 6 days
    const now = new Date();
    const countDownDate = new Date(now.getTime() + (6 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000) + (45 * 60 * 1000)).getTime();

    const timerInterval = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dEl = document.getElementById("d3");
        const hEl = document.getElementById("h3");
        const mEl = document.getElementById("m3");
        const sEl = document.getElementById("s3");

        if (dEl) dEl.innerText = days < 10 ? "0" + days : days;
        if (hEl) hEl.innerText = hours < 10 ? "0" + hours : hours;
        if (mEl) mEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        if (sEl) sEl.innerText = seconds < 10 ? "0" + seconds : seconds;

        if (distance < 0) {
            clearInterval(timerInterval);
            if (dEl) document.querySelector("#season3-timer-display").innerHTML = "<div class='episode-info'>EPISODE RELEASED!</div>";
        }
    }, 1000);
}

// Start the countdowns when page loads
document.addEventListener('DOMContentLoaded', () => {
    startCountdown();
    startCountdownSeason3();
});

/* --- Spoiler Reveal Logic --- */
window.revealSpoiler = function () {
    const spoiler = document.getElementById('storySpoiler');
    if (spoiler) {
        spoiler.classList.add('revealed');
    }
};

// --- Modal Logic (Trailers) ---
function openTrailerModal(videoId) {
    const modal = document.getElementById('trailerModal');
    const iframe = document.getElementById('trailerFrame');
    if (!videoId) videoId = '3NUizzImhig'; // Default as requested

    if (modal && iframe) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeTrailerModal(event) {
    if (event && event.target !== event.currentTarget && event.target.tagName !== 'BUTTON') return; // Close only on overlay or X click

    const modal = document.getElementById('trailerModal');
    const iframe = document.getElementById('trailerFrame');

    if (modal) {
        modal.classList.remove('active');
        if (iframe) iframe.src = ''; // Stop video
        document.body.style.overflow = '';
    }
}

/* --- JSON Data Loading Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    loadPostData();
});

async function loadPostData() {
    // Only run on post page
    if (!document.body.classList.contains('post-page')) return;

    try {
        // Wait for Firebase
        // Wait for Firebase
        if (!window.db || !window.collection) {
            let attempts = 0;
            while ((!window.db || !window.collection) && attempts < 100) { await new Promise(r => setTimeout(r, 100)); attempts++; }
            if (!window.db || !window.collection) throw new Error("Firebase init timed out");
        }

        const urlParams = new URLSearchParams(window.location.search);
        let postId = urlParams.get('id');
        let post = null;

        if (postId) {
            // Try fetching specific doc
            try {
                const docSnap = await window.getDoc(window.doc(window.db, "posts", postId));
                if (docSnap.exists()) {
                    post = { id: docSnap.id, ...docSnap.data() };
                }
            } catch (e) { console.log('Specific doc fetch failed, falling back to finding in all', e); }
        }

        // If not found or no ID, fetch all (fallback behavior from original code)
        if (!post) {
            const querySnapshot = await window.getDocs(window.collection(window.db, "posts"));
            const posts = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            if (postId) post = posts.find(p => p.id === postId);
            if (!post && posts.length > 0) post = posts[0];
        }

        if (post) {
            renderPost(post);
            // Track view for this post
            trackPostView(post.id);
        }

    } catch (error) {
        console.error('Error loading post data:', error);
    }
}

function renderPost(post) {
    // Title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = `${post.title} - TADB`;

    // Hero
    const heroPoster = document.getElementById('heroPoster');
    if (heroPoster) heroPoster.src = post.hero.poster;

    const heroLogo = document.getElementById('heroLogo');
    const heroTitleText = document.getElementById('heroTitleText');

    if (heroLogo && post.hero.logo) {
        heroLogo.src = post.hero.logo;
        heroLogo.style.display = 'block';
        if (heroTitleText) heroTitleText.style.display = 'none';
    } else if (heroTitleText) {
        heroTitleText.textContent = post.title;
        heroTitleText.style.display = 'block';
        if (heroLogo) heroLogo.style.display = 'none';
    }

    // Vertical Hero Title (Large Screens)
    const heroVerticalTitle = document.getElementById('heroVerticalTitle');
    if (heroVerticalTitle) {
        const title = post.title || '';
        heroVerticalTitle.textContent = title;

        // Reset any inline styles
        heroVerticalTitle.style.fontSize = '';
    }

    const heroBackdrop = document.querySelector('.hero-backdrop');
    if (heroBackdrop && post.hero.backdrop) {
        heroBackdrop.style.backgroundImage = `url('${post.hero.backdrop}')`;
        heroBackdrop.style.backgroundSize = 'cover';
        heroBackdrop.style.backgroundPosition = 'center';
    }

    // Tags
    const heroTags = document.getElementById('heroTags');
    if (heroTags && post.hero.tags) {
        heroTags.innerHTML = post.hero.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('');
    }

    // Hero Actions (Trailer)
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions) {
        // Get trailer URL from hero section
        let trailerUrl = post.hero?.trailerUrl || '';

        // Convert to video ID if it's a full URL
        let videoId = trailerUrl;
        if (trailerUrl.includes('youtube.com/watch')) {
            try {
                videoId = new URL(trailerUrl).searchParams.get('v');
            } catch (e) {
                console.error('Error parsing YouTube URL:', trailerUrl);
            }
        } else if (trailerUrl.includes('youtu.be/')) {
            videoId = trailerUrl.split('youtu.be/')[1].split('?')[0];
        }

        // Only show Watch Trailer button if trailer URL exists
        const trailerButton = videoId ?
            `<button class="btn btn-primary btn-lg" onclick="openTrailerModal('${videoId}')"><i class="fas fa-play"></i> Watch Trailer</button>` :
            '';

        heroActions.innerHTML = `
            ${trailerButton}
            <button class="btn btn-secondary btn-lg"><i class="fas fa-bookmark"></i> Add to List</button>
        `;
    }

    // Overview (Now Seasons)
    const seasonsContainer = document.getElementById('seasonsContainer');
    if (seasonsContainer && post.seasons) {
        let tabsHtml = '<div class="seasons-tabs">';
        let panelsHtml = '';
        const seenIds = new Set();

        post.seasons.forEach((season, index) => {
            // Ensure Unique ID
            if (!season.id || seenIds.has(season.id)) {
                season.id = (season.id || 'season') + '-' + index;
            }
            seenIds.add(season.id);

            const isActive = index === 0 ? 'active' : '';
            const displayStyle = index === 0 ? 'block' : 'none';

            // Tab
            tabsHtml += `<button class="season-tab ${isActive}" onclick="switchSeason(event, '${season.id}')">${season.name}</button>`;

            // -- Logic: Auto-Calculate Next Episode if Schedule Exists --
            let autoData = null;
            if (season.schedule) {
                autoData = getNextEpisodeRelease(season.schedule);
                // Override/Set countdown properties dynamically
                if (autoData) {
                    if (!season.countdown) season.countdown = {};
                    season.countdown.date = autoData.date;
                    season.countdown.episodeTag = `NEXT EPISODE: EP ${autoData.episode}`;
                    // Keep original title or footer if they exist, or generate generic ones
                    if (!season.countdown.title) season.countdown.title = `Episode ${autoData.episode}`;

                    // Update "Episodes Released" count in Overview
                    // Expects format like "4 / 12 Released" in JSON
                    if (season.overview && season.overview.episodes && season.overview.episodes.includes('/')) {
                        const parts = season.overview.episodes.split('/');
                        if (parts.length === 2) {
                            const totalStr = parts[1].trim(); // e.g. "12 Released" or "12"
                            // Extract numeric total if possible
                            const totalEpisodesMatch = totalStr.match(/(\d+)/);
                            const totalEpisodes = totalEpisodesMatch ? parseInt(totalEpisodesMatch[0]) : 9999;

                            const releasedCount = autoData.episode - (season.schedule.episodesPerRelease || 1);

                            // Check if Season is Finished
                            if (releasedCount >= totalEpisodes) {
                                // Hide Countdown
                                season.countdown = null;
                                season.overview.status = "Finished Airing";
                                season.overview.statusClass = ""; // Remove green color
                                season.overview.episodes = `${totalEpisodes} / ${totalStr}`;
                            } else {
                                season.overview.episodes = `${releasedCount} / ${totalStr}`;
                            }
                        }
                    }
                }
            }

            // Panel Content
            let panelContent = '';

            // Countdown
            if (season.countdown) {
                panelContent += `
                    <div class="countdown-wrapper" ${season.type === 'mixed' ? 'style="margin-bottom: 30px; border: none; box-shadow: none; background: transparent; padding: 0;"' : ''}>
                        <div class="countdown-header">
                            <span class="episode-tag">${season.countdown.episodeTag || 'NEXT EPISODE'}</span>
                            <span class="episode-info">${season.countdown.title}</span>
                        </div>
                        <div class="timer-display" id="timer-${season.id}" data-date="${season.countdown.date}">
                             <div class="time-unit"><span class="time-val d">00</span><span class="time-lbl">DAYS</span></div>
                             <div class="time-separator">:</div>
                             <div class="time-unit"><span class="time-val h">00</span><span class="time-lbl">HOURS</span></div>
                             <div class="time-separator">:</div>
                             <div class="time-unit"><span class="time-val m">00</span><span class="time-lbl">MINS</span></div>
                             <div class="time-separator">:</div>
                             <div class="time-unit"><span class="time-val s">00</span><span class="time-lbl">SECS</span></div>
                        </div>
                        ${season.countdown.footer ? `<div class="countdown-footer">${season.countdown.footer}</div>` : ''}
                    </div>
                `;
            }

            // Overview
            if (season.overview) {
                panelContent += `
                    <div class="info-grid user-requested-order">
                        <div class="info-card"><span class="info-label"><i class="fas fa-building"></i> Studio</span><span class="info-value">${season.overview.studio || '--'}</span></div>
                        <div class="info-card"><span class="info-label"><i class="fas fa-microphone-alt"></i> Dubbing Studio</span><span class="info-value">${season.overview.dubbingStudio || 'N/A'}</span></div>
                        <div class="info-card"><span class="info-label"><i class="fas fa-clock"></i> Status</span><span class="info-value ${season.overview.statusClass || ''}" ${season.overview.statusClass === 'status-airing' ? 'style="color: #4cd137;"' : ''}>${season.overview.status || '--'}</span></div>
                        <div class="info-card highlight-card dub-release-card">
                            <span class="info-label"><i class="fas fa-calendar-check"></i> DB RELEASE</span>
                            <div class="dub-release-slider">
                                ${Array.isArray(season.overview.dubReleases) && season.overview.dubReleases.length > 0 ?
                        season.overview.dubReleases.map((rel, idx) => `
                                        <div class="dub-release-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                                            <div class="platform-badge-header">
                                                <span class="platform-mini-badge">${rel.platform || 'N/A'}</span>
                                            </div>
                                            <span class="info-value">${rel.date || 'TBA'}</span>
                                        </div>
                                    `).join('') :
                        `
                                        <div class="dub-release-slide active" data-index="0">
                                            <div class="platform-badge-header">
                                                ${(season.overview.dubbingPlatform || '').split(',').map(p => p.trim() ? `<span class="platform-mini-badge">${p}</span>` : '<span class="platform-mini-badge">N/A</span>').join('')}
                                            </div>
                                            <span class="info-value">${season.overview.dubReleaseDate || 'TBA'}</span>
                                        </div>
                                    `
                    }
                            </div>
                            ${Array.isArray(season.overview.dubReleases) && season.overview.dubReleases.length > 1 ? `
                                <div class="dub-slider-dots">
                                    ${season.overview.dubReleases.map((_, idx) => `<span class="dub-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="info-card"><span class="info-label"><i class="fas fa-film"></i> Format</span><span class="info-value">${season.overview.format || '--'}</span></div>
                        <div class="info-card"><span class="info-label"><i class="fas fa-list-ol"></i> Episodes</span><span class="info-value">${season.overview.episodes || '--'}</span></div>
                        <div class="info-card"><span class="info-label"><i class="fas fa-hourglass-half"></i> Duration</span><span class="info-value">${season.overview.duration || '--'}</span></div>
                        <div class="info-card"><span class="info-label"><i class="fas fa-language"></i> Languages</span><span class="info-value">${season.overview.languages || '--'}</span></div>
                        <div class="info-card rating-card"><span class="info-label"><i class="fas fa-star"></i> IMDb Rating</span><span class="info-value rating-value highlight">${season.overview.rating || '--'}<span class="rating-max">/10</span></span></div>
                    </div>
                 `;
            }

            if (season.type === 'mixed') panelContent = `<div class="ongoing-season-wrapper">${panelContent}</div>`;
            panelsHtml += `<div class="season-panel ${isActive}" id="${season.id}" style="display:${displayStyle};">${panelContent}</div>`;
        });

        tabsHtml += '</div>';
        seasonsContainer.innerHTML = tabsHtml + panelsHtml;

        // Init Dub Mini Sliders
        initDubMiniSliders();

        // Initialize Timers
        post.seasons.forEach(season => {
            if (season.countdown) initDynamicTimer(`timer-${season.id}`, season.countdown.date);
        });
    }

    // Story
    const storyText = document.getElementById('storyText');
    if (storyText && post.story) {
        storyText.innerHTML = post.story.split('\\n\\n').map(p => `<p>${p}</p>`).join('');
    }

    // Empty Placeholder for Missing Sections
    const emptyStateHtml = `
        <div class="empty-state-card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 30px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1); width:100%;">
            <!-- Modern Dashed User SVG -->
            <svg width="55" height="55" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.4; margin-bottom:12px;">
                <circle cx="12" cy="7" r="4" stroke="var(--text-grey)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 3"/>
                <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" stroke="var(--text-grey)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 3"/>
            </svg>
            <span style="color:var(--text-grey); font-size:13px; font-weight:500; opacity: 0.7;">Unknown Cast</span>
        </div>
    `;

    // Cast
    const castList = document.getElementById('castList');
    if (castList) {
        if (post.cast && post.cast.length > 0) {
            castList.innerHTML = post.cast.map(c => {
                // Format season details for display
                let seasonsText = '-';
                let yearText = '-';
                let platformText = '-';

                if (c.seasonDetails && c.seasonDetails.length > 0) {
                    // Combine all seasons
                    const seasons = c.seasonDetails.map(d => d.season).filter(s => s).join(', ');
                    const years = [...new Set(c.seasonDetails.map(d => d.year).filter(y => y))].join(', ');
                    const platforms = [...new Set(c.seasonDetails.map(d => d.platform).filter(p => p))].join(', ');

                    seasonsText = seasons || '-';
                    yearText = years || '-';
                    platformText = platforms || '-';
                }

                return `
                <div class="cast-row-card" onclick="openCastModal(this)" 
                    data-artist="${c.name}"
                    data-role="${c.role}"
                    data-artist-img="${c.image}"
                    data-char="${c.characterName}"
                    data-char-img="${c.characterImage}"
                    data-seasons="${seasonsText}" 
                    data-year="${yearText}" 
                    data-platform="${platformText}">

                 <div class="actor-side">
                      <img src="${c.image}" alt="${c.name}" class="actor-img">
                      <div class="performer-info">
                          <span class="performer-name">${c.name}</span>
                          <span class="performer-role">${c.role}</span>
                      </div>
                  </div>
                  <div class="character-side">
                      <div class="char-info">
                          <span class="char-name">${c.characterName}</span>
                          <span class="media-source">${c.characterLabel || 'Crunchyroll'}</span>
                      </div>
                      <img src="${c.characterImage}" alt="${c.characterName}" class="char-img">
                  </div>
                </div>
            `;
            }).join('');
        } else {
            // Show placeholder if cast is empty
            castList.innerHTML = emptyStateHtml;
        }
    }

    // Crew
    const crewList = document.getElementById('crewList');
    if (crewList) {
        if (post.crew && post.crew.length > 0) {
            crewList.innerHTML = post.crew.map(c => {
                // Format season details for display
                let seasonsText = '-';
                let yearText = '-';
                let platformText = '-';

                if (c.seasonDetails && c.seasonDetails.length > 0) {
                    // Combine all seasons
                    const seasons = c.seasonDetails.map(d => d.season).filter(s => s).join(', ');
                    const years = [...new Set(c.seasonDetails.map(d => d.year).filter(y => y))].join(', ');
                    const platforms = [...new Set(c.seasonDetails.map(d => d.platform).filter(p => p))].join(', ');

                    seasonsText = seasons || '-';
                    yearText = years || '-';
                    platformText = platforms || '-';
                }

                return `
                <div class="cast-row-card crew-card" onclick="openCastModal(this)"
                    data-artist="${c.name}"
                    data-role="${c.role}"
                    data-artist-img="${c.image}"
                    data-char="${c.role}"
                    data-char-img=""
                    data-seasons="${seasonsText}"
                    data-year="${yearText}"
                    data-platform="${platformText}">
                     <div class="actor-side">
                        <img src="${c.image}" alt="${c.name}" class="actor-img">
                        <div class="performer-info">
                            <span class="performer-name">${c.name}</span>
                            <span class="performer-role">${c.role}</span>
                        </div>
                     </div>
                     <div class="character-side">
                        <span class="media-source">${c.characterLabel || platformText}</span>
                     </div>
                </div>
             `;
            }).join('');
        } else {
            // Show placeholder if crew is empty
            crewList.innerHTML = emptyStateHtml;
        }
    }

    // Platforms & Where to Watch Redesign
    const platforms = document.getElementById('platformGrid');
    if (platforms && post.platforms) {

        // Helper for Logos (Using reliable Wikimedia/Official sources where possible)
        const getPlatformLogo = (name) => {
            return null; // Sample logic removed
        };

        platforms.innerHTML = post.platforms.map(p => {
            const logoUrl = p.logo || getPlatformLogo(p.name);
            const logoHtml = logoUrl
                ? `<img src="${logoUrl}" alt="${p.name}" class="platform-logo">`
                : `<div class="platform-logo-fallback"><i class="fas fa-play"></i></div>`;

            return `
             <a href="${p.url}" target="_blank" class="platform-premium-card ${p.class || ''}">
                <div class="platform-left">
                    ${logoHtml}
                    <div class="platform-info">
                        <span class="platform-title">${p.name}</span>
                        <span class="platform-cta">${p.cta || 'Stream Now'}</span>
                    </div>
                </div>
                <div class="platform-icon">
                    <i class="fas fa-external-link-alt"></i>
                </div>
            </a>
        `;
        }).join('');
    }

    // Media Content Distributer (Trailers, Clips, Openings, Endings)
    const mediaObj = post.media || {};
    const allMedia = mediaObj.trailers || [];

    console.log('Loading trailers:', allMedia);

    const containers = {
        'Trailer': document.getElementById('media-trailers'),
        'Teaser': document.getElementById('media-trailers'),
        'Official Trailer': document.getElementById('media-trailers'),
        'Final Trailer': document.getElementById('media-trailers'),
        'Clip': document.getElementById('media-clips'),
        'Opening': document.getElementById('media-openings'),
        'Ending': document.getElementById('media-endings'),
        'Extra': document.getElementById('media-gallery') // Using Gallery as a fallback for Extras/Images for now
    };

    // Clear all
    Object.values(containers).forEach(c => { if (c) c.innerHTML = ''; });

    allMedia.forEach(m => {
        // Convert YouTube URL to embed format
        let embedUrl = m.url || '';

        console.log('Processing trailer URL:', embedUrl);

        // Handle different YouTube URL formats
        if (embedUrl.includes('youtube.com/watch')) {
            try {
                const videoId = new URL(embedUrl).searchParams.get('v');
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } catch (e) {
                console.error('Error parsing YouTube URL:', embedUrl);
            }
        } else if (embedUrl.includes('youtu.be/')) {
            const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (!embedUrl.includes('embed') && embedUrl.length > 0) {
            // If it's just a video ID, convert to embed URL
            embedUrl = `https://www.youtube.com/embed/${embedUrl}`;
        }

        console.log('Final embed URL:', embedUrl);

        const type = m.type || 'Trailer';
        const title = m.title || 'Video';
        const container = containers[type] || containers['Trailer'];

        if (container && embedUrl) {
            container.innerHTML += `
                <div class="media-card-premium">
                    <div class="video-wrapper">
                        <iframe 
                            src="${embedUrl}" 
                            title="${title}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    <div class="media-info">
                        <span class="media-type-badge">${type}</span>
                        <h4 class="media-title">${title}</h4>
                    </div>
                </div>
            `;
        }
    });

    // Render Gallery Images
    const galleryContainer = document.getElementById('media-gallery');
    if (galleryContainer && mediaObj.gallery) {
        mediaObj.gallery.forEach(item => {
            // Normalize item (string vs object)
            const url = typeof item === 'object' ? item.url : item;
            const caption = typeof item === 'object' ? item.caption : '';
            const link = typeof item === 'object' ? item.link : '';

            // Click behavior: Link takes priority, otherwise open image
            const clickAction = link
                ? `window.open('${link}', '_blank')`
                : `window.open('${url}', '_blank')`;

            galleryContainer.innerHTML += `
                <div class="media-card-premium" style="aspect-ratio: 2/3; cursor: pointer; position: relative; overflow: hidden;" onclick="${clickAction}">
                    <img src="${url}" alt="${caption || 'Gallery Image'}" style="width: 100%; height: 100%; object-fit: cover;">
                    ${caption ? `<div class="gallery-badge">${caption}</div>` : ''}
                </div>
            `;
        });
    }

    // Ticker / News Update
    const newsWrapper = document.querySelector('.mobile-news-wrapper');
    if (newsWrapper) {
        if (post.ticker && post.ticker.length > 0) {
            const track = newsWrapper.querySelector('.news-track');
            if (track) {
                const itemsHtml = post.ticker.map(item => {
                    const textContent = item.link
                        ? `<a href="${item.link}" target="_blank" style="color: inherit; text-decoration: underline; text-decoration-color: var(--primary-color);">${item.text}</a>`
                        : item.text;

                    return `
                    <div class="news-item">
                        <span class="news-badge">${item.badge}</span>
                        <span class="news-text">${textContent}</span>
                    </div>
                `}).join('');
                // Duplicate for seamless scroll
                track.innerHTML = itemsHtml + itemsHtml + itemsHtml + itemsHtml;
            }
            newsWrapper.style.display = '';
        } else {
            newsWrapper.style.display = 'none';
        }
    }

    // Hide empty tabs logic
    const tabs = document.querySelectorAll('.media-tab');
    tabs.forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/'([^']+)'/);
            if (match) {
                const targetId = match[1];
                const container = document.getElementById(targetId);
                if (container && container.children.length === 0) {
                    tab.style.display = 'none'; // Auto-hide tabs with no content
                } else {
                    tab.style.display = 'inline-block';
                }
            }
        }
    });
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text || '--';
    }
}

function initDynamicTimer(elementId, targetDateStr) {
    const timerDisplay = document.getElementById(elementId);
    if (!timerDisplay) return;

    const countDownDate = new Date(targetDateStr).getTime();

    const dEl = timerDisplay.querySelector('.d');
    const hEl = timerDisplay.querySelector('.h');
    const mEl = timerDisplay.querySelector('.m');
    const sEl = timerDisplay.querySelector('.s');

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (dEl) dEl.innerText = days < 10 ? "0" + days : days;
        if (hEl) hEl.innerText = hours < 10 ? "0" + hours : hours;
        if (mEl) mEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        if (sEl) sEl.innerText = seconds < 10 ? "0" + seconds : seconds;

        if (distance < 0) {
            clearInterval(interval);
            timerDisplay.innerHTML = "<div class='episode-info'>EPISODE RELEASED!</div>";
        }
    }, 1000);
}

// --- Dub Mini Sliders ---
function initDubMiniSliders() {
    // Clear any existing intervals if needed (though renderPost overwrites HTML)
    const cards = document.querySelectorAll('.dub-release-card');
    cards.forEach(card => {
        const slides = card.querySelectorAll('.dub-release-slide');
        const dots = card.querySelectorAll('.dub-dot');
        if (slides.length <= 1) return;

        let current = 0;
        const updateSlider = (index) => {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));

            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
        };

        // Auto slide
        setInterval(() => {
            current = (current + 1) % slides.length;
            updateSlider(current);
        }, 10000);

        // Dot clicks
        dots.forEach((dot, idx) => {
            dot.onclick = () => {
                current = idx;
                updateSlider(current);
            };
        });
    });
}

function getNextEpisodeRelease(schedule, type = 'post') {
    if (!schedule || !schedule.startDate) return null;

    let targetDate = new Date(schedule.startDate);
    let episode = schedule.startEpisode || 1;
    const now = new Date();
    const interval = (schedule.intervalDays || 7) * 24 * 60 * 60 * 1000;

    while (targetDate.getTime() <= now.getTime()) {
        targetDate = new Date(targetDate.getTime() + interval);
        episode += (schedule.episodesPerRelease || 1);
    }

    return {
        date: targetDate,
        episode: episode
    };
}

/* --- Dubbing Release Carousel Logic --- */

/* --- Upcoming Anime Slider Logic --- */
async function initUpcomingSlider() {
    const slider = document.getElementById('upcomingSlider');
    if (!slider) return;

    try {
        if (!window.db || !window.collection) {
            let attempts = 0;
            while ((!window.db || !window.collection) && attempts < 100) { await new Promise(r => setTimeout(r, 100)); attempts++; }
        }

        const querySnapshot = await window.getDocs(window.collection(window.db, "posts"));
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        const now = new Date();
        const upcomingPosts = [];

        posts.forEach(post => {
            if (post.seasons) {
                post.seasons.forEach(season => {
                    let countdownDate = null;

                    // Upcoming is for EXPLICIT countdown dates (major events/season starts)
                    // We skip 'mixed' or 'scheduled' here because they go to Latest Episodes
                    if (season.type === 'countdown' && season.countdown && season.countdown.date) {
                        countdownDate = new Date(season.countdown.date);
                    }

                    if (countdownDate && countdownDate > now) {
                        upcomingPosts.push({
                            id: post.id,
                            title: post.title,
                            image: post.hero.poster,
                            countdownDate: countdownDate,
                            seasonName: season.name,
                            episodeTitle: (season.countdown && season.countdown.title) || 'New Episode'
                        });
                    }
                });
            }
        });

        // Sort by countdown date (soonest first)
        upcomingPosts.sort((a, b) => a.countdownDate - b.countdownDate);

        // Filter unique by post ID (keeping the ones that are airing soonest)
        const uniqueUpcoming = Array.from(new Set(upcomingPosts.map(a => a.id)))
            .map(id => upcomingPosts.find(a => a.id === id));

        if (uniqueUpcoming.length === 0) {
            const section = document.querySelector('.upcoming-section');
            if (section) section.style.display = 'none';
            return;
        }

        slider.innerHTML = uniqueUpcoming.map((item, idx) => `
            <div class="upcoming-card" onclick="window.location.href='post.html?id=${item.id}'">
                <div class="up-poster">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="up-badge">Upcoming</div>
                    <div class="up-timer" id="up-timer-${item.id}" data-date="${item.countdownDate}">
                        <div class="timer-unit"><span class="val d">00</span><span class="lbl">d</span></div>
                        <div class="timer-unit"><span class="val h">00</span><span class="lbl">h</span></div>
                        <div class="timer-unit"><span class="val m">00</span><span class="lbl">m</span></div>
                        <div class="timer-unit"><span class="val s">00</span><span class="lbl">s</span></div>
                    </div>
                </div>
                <div class="up-info">
                    <h3>${item.title}</h3>
                    <p class="up-meta">${item.episodeTitle.includes(item.seasonName) ? item.episodeTitle : item.seasonName + ' • ' + item.episodeTitle}</p>
                </div>
            </div>
        `).join('');

        // Init Timers
        uniqueUpcoming.forEach((item) => {
            initDynamicTimer(`up-timer-${item.id}`, item.countdownDate);
        });



    } catch (e) {
        console.error('Error init upcoming:', e);
    }
}

/* --- Latest Episodes Slider Logic --- */
async function initLatestEpisodesSlider() {
    const slider = document.getElementById('latestEpisodesSlider');
    if (!slider) return;

    try {
        if (!window.db || !window.collection) {
            let attempts = 0;
            while ((!window.db || !window.collection) && attempts < 100) { await new Promise(r => setTimeout(r, 100)); attempts++; }
        }

        const querySnapshot = await window.getDocs(window.collection(window.db, "posts"));
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        const now = new Date();
        const latestEps = [];

        posts.forEach(post => {
            if (post.seasons) {
                post.seasons.forEach(season => {
                    // Check for schedule in 'mixed' or specifically scheduled seasons
                    if (season.schedule && season.schedule.startDate) {
                        const nextEp = getNextEpisodeRelease(season.schedule);

                        if (nextEp) {
                            latestEps.push({
                                id: post.id,
                                title: post.title,
                                image: post.hero.poster,
                                countdownDate: nextEp.date,
                                seasonName: season.name,
                                episodeNumber: nextEp.episode,
                                // If it's mixed, it might have a title in countdown object
                                episodeTitle: (season.countdown && season.countdown.title) || `Episode ${nextEp.episode} `
                            });
                        }
                    }
                });
            }
        });

        // Sort by countdown date (soonest first)
        latestEps.sort((a, b) => a.countdownDate - b.countdownDate);

        if (latestEps.length === 0) {
            const section = document.querySelector('.latest-episodes-section');
            if (section) section.style.display = 'none';
            return;
        }

        slider.innerHTML = latestEps.map((item, idx) => `
            <div class="upcoming-card" onclick="window.location.href='post.html?id=${item.id}'">
                <div class="up-poster">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="up-badge" style="background:var(--accent-color); color:#000;">New Episode</div>
                    <div class="up-timer" id="latest-timer-${item.id}-${idx}" data-date="${item.countdownDate}">
                        <div class="timer-unit"><span class="val d">00</span><span class="lbl">d</span></div>
                        <div class="timer-unit"><span class="val h">00</span><span class="lbl">h</span></div>
                        <div class="timer-unit"><span class="val m">00</span><span class="lbl">m</span></div>
                        <div class="timer-unit"><span class="val s">00</span><span class="lbl">s</span></div>
                    </div>
                </div>
                <div class="up-info">
                    <h3>${item.title}</h3>
                    <p class="up-meta">${item.seasonName} • Episode ${item.episodeNumber}</p>
                </div>
            </div>
        `).join('');

        // Init Timers
        latestEps.forEach((item, idx) => {
            initDynamicTimer(`latest-timer-${item.id}-${idx}`, item.countdownDate);
        });

    } catch (e) {
        console.error('Error init latest episodes:', e);
    }
}

// Ensure it runs on load
document.addEventListener('DOMContentLoaded', () => {
    initUpcomingSlider();
    initLatestEpisodesSlider(); trackSiteVisit();

    // Session Tracking for Context
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        sessionStorage.setItem('currentPostId', id); trackSiteVisit();

        // Dynamic Link Update for Side Menu 'Cast'
        const castLink = document.querySelector('.side-nav-item[href="cast-crew.html"]');
        if (castLink) {
            castLink.href = `cast - crew.html ? id = ${id} `;
        }
    }
});

/* =========================================
   LEGAL MODAL FUNCTIONS
   ========================================= */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    }
}

// Close modal on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});
// AdSense removed

// Analytics Tracking Functions
async function trackPostView(postId) {
    if (!window.db || !postId) return;
    try {
        const postRef = window.doc(window.db, "posts", postId);
        await window.updateDoc(postRef, {
            views: window.increment(1)
        });
    } catch (e) {
        console.debug("Post view tracking failed");
    }
}

async function trackSiteVisit() {
    if (!window.db) return;
    try {
        const sessionKey = "site_visited_" + new Date().toISOString().split("T")[0];
        if (!sessionStorage.getItem(sessionKey)) {
            const statsRef = window.doc(window.db, "stats", "site");
            await window.setDoc(statsRef, {
                totalVisits: window.increment(1),
                lastActive: window.serverTimestamp()
            }, { merge: true });
            sessionStorage.setItem(sessionKey, "true");
        }
        const statsRef = window.doc(window.db, "stats", "site");
        await window.setDoc(statsRef, {
            totalPageViews: window.increment(1)
        }, { merge: true });
    } catch (e) {
        console.debug("Site visit tracking failed");
    }
}
