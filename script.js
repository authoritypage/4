/*
    PharmaInsight Core | script.js
    Handles smooth scrolling for gallery cards and other UI interactions.
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Cache ---
    const galleryCards = document.querySelectorAll('.gallery-card');
    const headerActionLinks = document.querySelectorAll('.header-action-links .action-link-item');
    const viewFullRationaleBtn = document.querySelector('.scroll-to-content');
    const siteHeader = document.querySelector('.site-header');

    // --- Set initial CSS variable for header height for scroll-margin-top calculation ---
    // This allows CSS `scroll-margin-top` to dynamically adapt to the header's sticky height.
    const updateHeaderHeightCSSVar = () => {
        document.documentElement.style.setProperty('--site-header-height', `${siteHeader.offsetHeight}px`);
    };
    updateHeaderHeightCSSVar();
    window.addEventListener('resize', updateHeaderHeightCSSVar);


    // --- Functions ---

    /**
     * Handles smooth scrolling for all internal anchor links.
     * Offsets scroll position to account for the sticky header.
     * @param {Event} event - The click event.
     */
    function handleSmoothScroll(event) {
        event.preventDefault(); // Prevent default instant jump

        const targetId = this.getAttribute('href').substring(1); // Get the ID from href
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // Calculate scroll position, accounting for sticky header height
            const headerHeight = siteHeader.offsetHeight;
            const offsetTop = targetElement.offsetTop - headerHeight - 20; // 20px for extra padding/buffer

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Sets the current year in the footer.
     */
    function setCurrentYear() {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- Setup Event Listeners ---
    function setupEventListeners() {
        // Smooth scroll for gallery cards
        galleryCards.forEach(card => {
            card.addEventListener('click', handleSmoothScroll);
        });

        // Smooth scroll for "View Full Rationale" button
        if (viewFullRationaleBtn) {
            viewFullRationaleBtn.addEventListener('click', handleSmoothScroll);
            // Ensure the button points to the first section of the full outline
            const firstOutlineSection = document.querySelector('.full-outline-content .outline-section');
            if (firstOutlineSection) {
                viewFullRationaleBtn.href = `#${firstOutlineSection.id}`;
            }
        }

        // Smooth scroll for header action links
        headerActionLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#')) { // Only apply to internal links
                link.addEventListener('click', handleSmoothScroll);
            }
        });

        setCurrentYear();
    }

    setupEventListeners();
});
