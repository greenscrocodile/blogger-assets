/* TADB Improved Preloader Logic */
(function () {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

document.addEventListener('DOMContentLoaded', function () {
    const preloader = document.getElementById('preloader');
    const progressBar = document.querySelector('.loader-progress-bar');

    // Initial reveal
    setTimeout(() => {
        if (preloader) preloader.style.opacity = '1';
    }, 100);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) {
            progress = 95;
            clearInterval(interval);
        }
        if (progressBar) progressBar.style.width = progress + '%';
    }, 200);

    const finishLoading = () => {
        clearInterval(interval);
        if (progressBar) progressBar.style.width = '100%';

        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('loaded');
                document.body.style.overflow = ''; // Restore scroll
            }

            // Fully remove from view after animation
            setTimeout(() => {
                if (preloader) preloader.style.display = 'none';
            }, 1000);
        }, 500);
    };

    // Wait for full window load
    if (document.readyState === 'complete') {
        setTimeout(finishLoading, 2000); // Forces at least 2s of beauty
    } else {
        window.addEventListener('load', () => {
            const timeLoaded = Date.now();
            const elapsed = timeLoaded - window._startTime;
            const delay = Math.max(2000 - elapsed, 500);
            setTimeout(finishLoading, delay);
        });
    }

    // High z-index enforcement
    if (preloader) preloader.style.zIndex = '2147483647';
});

// Capture start time early
window._startTime = Date.now();
