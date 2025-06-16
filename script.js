/*
    Pharmacological Outline: High-Dose Stimulant Rationale | script.js
    Enhances the reading experience with dynamic Table of Contents,
    scroll progress indication, and active section highlighting.
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Cache ---
    const outlineContent = document.querySelector('.outline-content');
    const tocNav = document.getElementById('toc-nav');
    const sections = outlineContent.querySelectorAll('.section-chapter'); // Main chapter sections
    const readingProgressBar = document.getElementById('reading-progress-bar');
    const siteHeader = document.querySelector('.site-header');

    // --- State Variables ---
    let observer; // Intersection Observer for active TOC links

    // --- Initialization ---
    generateTableOfContents();
    setupEventListeners();
    setupIntersectionObserver(); // For scroll spy

    // --- Functions ---

    /**
     * Dynamically generates the Table of Contents from h2 and h3 headings in the paper content.
     */
    function generateTableOfContents() {
        const tocList = document.createElement('ul');
        let currentLevel1Item = null;

        sections.forEach((section) => {
            const h2 = section.querySelector('h2');
            if (h2) {
                // Skip if the h2 does not have an ID or text content that makes sense for TOC
                if (!section.id || !h2.textContent.trim()) return;

                // Create L1 TOC item (Chapter H2)
                currentLevel1Item = document.createElement('li');
                const h2Link = document.createElement('a');
                h2Link.href = `#${section.id}`;

                // Extract relevant text for TOC: Use data-level + remaining text or full H2 text.
                let linkText = h2.textContent.trim();
                if (h2.hasAttribute('data-level')) {
                    const dataLevel = h2.getAttribute('data-level');
                    // Remove "I. " or "Summary" if it's the start of the h2 text for cleaner TOC display
                    linkText = linkText.replace(new RegExp(`^${dataLevel}\\.\\s*`, 'i'), '').trim();
                    if (dataLevel !== "Summary") { // Prepend data-level for Roman numerals but not "Summary"
                        linkText = `${dataLevel}. ${linkText}`;
                    }
                }
                h2Link.textContent = linkText;
                currentLevel1Item.appendChild(h2Link);
                tocList.appendChild(currentLevel1Item);

                // Check for H3s within this section to create L2 TOC items
                const h3s = section.querySelectorAll('h3');
                if (h3s.length > 0) {
                    const subList = document.createElement('ul');
                    h3s.forEach(h3 => {
                        if (!h3.id || !h3.textContent.trim()) return;

                        const subListItem = document.createElement('li');
                        const h3Link = document.createElement('a');
                        h3Link.href = `#${h3.id}`;

                        // Extract relevant H3 text for TOC, e.g., "A. Dopamine Hijacking" becomes "Dopamine Hijacking"
                        let h3Text = h3.textContent.trim();
                        const match = h3Text.match(/^(?:[A-Z]\.|\d+\.)\s+(.*)/); // Matches "A. " or "1. "
                        if (match && match[1]) {
                            h3Text = match[1];
                        }
                        h3Link.textContent = h3Text;
                        subListItem.appendChild(h3Link);
                        subList.appendChild(subListItem);
                    });
                    if (currentLevel1Item) {
                        currentLevel1Item.appendChild(subList);
                    }
                }
            }
        });
        tocNav.appendChild(tocList);
    }


    /**
     * Sets up global event listeners.
     */
    function setupEventListeners() {
        window.addEventListener('scroll', updateReadingProgress);
        window.addEventListener('scroll', handleHeaderShrink);
        window.addEventListener('resize', updateReadingProgress); // Adjust progress on resize

        // Handle smooth scrolling for all internal anchor links (for general good measure, though default is smooth)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // Prevent default behavior only for links that would trigger JS scroll spy updates immediately
                // e.preventDefault(); // If you want to fully control scroll without default smooth behavior

                // Optional: For very complex layouts or JS-driven scrolling, might need to manually handle scroll-offset here.
                // const targetId = this.getAttribute('href').substring(1);
                // const targetElement = document.getElementById(targetId);
                // if (targetElement) {
                //     const headerHeight = siteHeader.offsetHeight;
                //     window.scrollTo({
                //         top: targetElement.offsetTop - headerHeight - 20, // Adjust 20 for extra buffer
                //         behavior: 'smooth'
                //     });
                // }
            });
        });
    }

    /**
     * Updates the reading progress bar based on scroll position.
     */
    function updateReadingProgress() {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        let progress = (scrolled / totalHeight) * 100;
        if (totalHeight <= 0) progress = 0; // Prevent NaN for very short pages

        readingProgressBar.style.width = `${progress}%`;
    }

    /**
     * Adds/removes a 'scrolled' class to the header based on scroll position,
     * triggering CSS animations for header shrinkage.
     */
    function handleHeaderShrink() {
        if (window.scrollY > 50) { // Trigger after 50px scroll
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    }

    /**
     * Sets up Intersection Observer to highlight active sections in the TOC.
     */
    function setupIntersectionObserver() {
        const headerOffset = siteHeader.offsetHeight + 40; // Account for sticky header height + buffer
        const threshold = 0.3; // When 30% of the section is visible

        observer = new IntersectionObserver((entries) => {
            let activeSectionId = null;

            // Iterate entries from bottom to top to find the most prominent section
            for (let i = entries.length - 1; i >= 0; i--) {
                const entry = entries[i];
                if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                    activeSectionId = entry.target.id;
                    break;
                }
            }

            // Fallback for very top of the page if no major section is clearly in view yet
            if (!activeSectionId && window.scrollY < sections[0].offsetTop) {
                activeSectionId = sections[0].id;
            }

            // Apply 'active' class to TOC link
            tocNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
            if (activeSectionId) {
                const activeLink = tocNav.querySelector(`a[href="#${activeSectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        }, {
            rootMargin: `-${headerOffset}px 0px 0px 0px`, // Adjust viewport top edge
            threshold: threshold // React at given threshold
        });

        // Observe all main sections (H2s) and sub-sections (H3s) for TOC highlighting
        outlineContent.querySelectorAll('.section-chapter[id], h3[id]').forEach(element => {
            observer.observe(element);
        });

        // Initial highlight on load
        // This is important because the observer might not trigger immediately on DOMContentLoaded
        setTimeout(() => updateActiveTOCLinkOnLoad(), 100); // Small delay to ensure layout calculated
    }

    /**
     * Special function to determine active TOC link immediately on load.
     */
    function updateActiveTOCLinkOnLoad() {
        const headerOffset = siteHeader.offsetHeight + 40;
        let foundActive = false;
        // Check main sections first
        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= headerOffset && rect.bottom > headerOffset) {
                const id = section.id;
                const tocLink = tocNav.querySelector(`a[href="#${id}"]`);
                if (tocLink) {
                    tocNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                    tocLink.classList.add('active');
                    foundActive = true;
                    break;
                }
            }
        }

        // If no main section, try h3s
        if (!foundActive) {
            outlineContent.querySelectorAll('h3[id]').forEach(h3 => {
                const rect = h3.getBoundingClientRect();
                if (rect.top <= headerOffset && rect.bottom > headerOffset && !foundActive) {
                    const id = h3.id;
                    const tocLink = tocNav.querySelector(`a[href="#${id}"]`);
                    if (tocLink) {
                        tocNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                        tocLink.classList.add('active');
                        foundActive = true;
                    }
                }
            });
        }

        // Fallback: If nothing is visible (e.g., page very short), activate the first link
        if (!foundActive && tocNav.querySelector('a')) {
            tocNav.querySelector('a').classList.add('active');
        }
    }

    // Call update on window load/resize as well for robustness
    window.addEventListener('load', updateReadingProgress);
    window.addEventListener('resize', updateReadingProgress);
});
