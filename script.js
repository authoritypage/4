/*
    Pharmacological Insight | script.js
    Handles modular content display, interactive navigation,
    dynamic TOC generation, and progress indication.
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Cache ---
    const contentDisplay = document.getElementById('content-display');
    const tocNav = document.getElementById('toc-nav');
    const readingProgressBar = document.getElementById('reading-progress-bar');
    const prevModuleBtns = document.querySelectorAll('.btn.prev');
    const nextModuleBtns = document.querySelectorAll('.btn.next');
    const siteHeader = document.querySelector('.site-header');

    // --- State Variables ---
    let modules = [];       // Array of all module DOM elements
    let currentModuleIndex = 0; // Current active module index

    // --- Initialization ---
    extractModules();
    generateTableOfContents();
    initializeModuleDisplay();
    setupEventListeners();
    updateProgressAndButtons(); // Set initial state of progress and buttons

    // Set a CSS variable for header height once to use in CSS
    // This allows CSS to use dynamic values from JS
    const setHeaderHeightCSSVar = () => {
        document.documentElement.style.setProperty('--site-header-height', `${siteHeader.offsetHeight}px`);
    };
    setHeaderHeightCSSVar();
    window.addEventListener('resize', setHeaderHeightCSSVar); // Update on resize


    // --- Functions ---

    /**
     * Extracts all modules from the DOM and stores them in the `modules` array.
     */
    function extractModules() {
        modules = Array.from(contentDisplay.querySelectorAll('.module'));
    }

    /**
     * Generates the Table of Contents dynamically based on modules and their `data-nav-label`.
     */
    function generateTableOfContents() {
        const tocList = document.createElement('ul');
        modules.forEach((module, index) => {
            const moduleId = module.dataset.moduleId;
            const navLabel = module.dataset.navLabel || module.querySelector('.module-title')?.textContent || `Module ${index + 1}`;

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${moduleId}`;
            link.textContent = navLabel;
            link.dataset.index = index; // Store index for quick navigation

            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });
        tocNav.appendChild(tocList);
    }

    /**
     * Sets up the initial display, showing only the first module.
     */
    function initializeModuleDisplay() {
        modules.forEach((module, index) => {
            if (index === currentModuleIndex) {
                module.classList.add('active');
            } else {
                module.classList.remove('active');
            }
        });
        updateTOCActiveLink();
    }

    /**
     * Shows a specific module based on its index with a sliding animation.
     * @param {number} newIndex - The index of the module to display.
     * @param {string} direction - 'next' or 'prev' for animation context.
     */
    function showModule(newIndex, direction) {
        if (newIndex < 0 || newIndex >= modules.length || newIndex === currentModuleIndex) {
            return;
        }

        const currentModule = modules[currentModuleIndex];
        const nextModule = modules[newIndex];

        // Apply exit animation to current module
        currentModule.classList.remove('active');
        currentModule.classList.add(direction === 'next' ? 'animate-prev' : 'animate-next');

        // Allow time for exit animation, then activate new module
        setTimeout(() => {
            currentModule.classList.remove('animate-prev', 'animate-next');
            nextModule.classList.add('active');

            // Apply entry animation to new module based on direction
            nextModule.classList.add(direction === 'next' ? 'animate-next' : 'animate-prev');
            // Remove animation class after it completes to reset for next transition
            nextModule.addEventListener('transitionend', () => {
                nextModule.classList.remove('animate-next', 'animate-prev');
            }, { once: true });

        }, 0); // Short delay to ensure current module gets its animation class before it's hidden

        currentModuleIndex = newIndex;
        updateProgressAndButtons();
        updateTOCActiveLink();
    }

    /**
     * Updates the active class in the Table of Contents.
     */
    function updateTOCActiveLink() {
        tocNav.querySelectorAll('a').forEach(link => {
            if (parseInt(link.dataset.index) === currentModuleIndex) {
                link.classList.add('active');
                // Ensure active link is visible in scrollable TOC
                link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Updates the reading progress bar and disables/enables navigation buttons.
     */
    function updateProgressAndButtons() {
        // Progress Bar
        const progress = ((currentModuleIndex + 1) / modules.length) * 100;
        readingProgressBar.style.width = `${progress}%`;

        // Navigation Buttons
        prevModuleBtns.forEach(btn => btn.disabled = currentModuleIndex === 0);
        nextModuleBtns.forEach(btn => btn.disabled = currentModuleIndex === modules.length - 1);
    }

    /**
     * Sets up all event listeners.
     */
    function setupEventListeners() {
        // Next buttons
        nextModuleBtns.forEach(btn => {
            btn.addEventListener('click', () => showModule(currentModuleIndex + 1, 'next'));
        });

        // Previous buttons
        prevModuleBtns.forEach(btn => {
            btn.addEventListener('click', () => showModule(currentModuleIndex - 1, 'prev'));
        });

        // TOC links
        tocNav.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor jump
            const targetLink = event.target.closest('a');
            if (targetLink && targetLink.dataset.index) {
                const targetIndex = parseInt(targetLink.dataset.index);
                if (targetIndex !== currentModuleIndex) {
                    const direction = targetIndex > currentModuleIndex ? 'next' : 'prev';
                    showModule(targetIndex, direction);
                }
            }
        });

        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }
});
