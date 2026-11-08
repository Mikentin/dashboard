document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    
    // Stats elements
    const statTotal = document.getElementById('stat-total');
    const statGeneral = document.getElementById('stat-general');
    const statTeam = document.getElementById('stat-team');

    // Groups & Cards
    const generalGroup = document.getElementById('group-general');
    const teamGroup = document.getElementById('group-team');
    const generalCards = generalGroup.querySelectorAll('.link-card');
    const teamCards = teamGroup.querySelectorAll('.link-card');
    const allCards = document.querySelectorAll('.link-card');

    // Open All Buttons
    const openAllGeneralBtn = document.getElementById('open-all-general');
    const openAllTeamBtn = document.getElementById('open-all-team');

    /* ----------------------------------------------------
       CLOCK & DYNAMIC GREETING
    ---------------------------------------------------- */
    const updateTimeAndGreeting = () => {
        const now = new Date();
        
        // Update digital clock (HH:MM:SS)
        clockEl.textContent = now.toTimeString().split(' ')[0];

        // Update Russian Date
        const day = now.getDate();
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        dateEl.textContent = `${day} ${month} ${year}`;
    };

    // Initial run and interval
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 1000);


    /* ----------------------------------------------------
       RADIAL MOUSE GLOW TRACKING
    ---------------------------------------------------- */
    allCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });


    /* ----------------------------------------------------
       LIVE SEARCH FILTERING
    ---------------------------------------------------- */
    const filterLinks = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Show/hide clear button
        if (query.length > 0) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }

        let visibleGeneralCount = 0;
        let visibleTeamCount = 0;

        // Filter General Group
        generalCards.forEach(card => {
            const name = card.getAttribute('data-name');
            if (name.includes(query)) {
                card.classList.remove('hidden');
                visibleGeneralCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Filter Team Group
        teamCards.forEach(card => {
            const name = card.getAttribute('data-name');
            if (name.includes(query)) {
                card.classList.remove('hidden');
                visibleTeamCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Show/hide entire groups based on item visibility
        if (visibleGeneralCount === 0 && query !== '') {
            generalGroup.classList.add('hidden');
        } else {
            generalGroup.classList.remove('hidden');
        }

        if (visibleTeamCount === 0 && query !== '') {
            teamGroup.classList.add('hidden');
        } else {
            teamGroup.classList.remove('hidden');
        }

        // Update counts dynamically
        statGeneral.textContent = visibleGeneralCount;
        statTeam.textContent = visibleTeamCount;
        statTotal.textContent = visibleGeneralCount + visibleTeamCount;
    };

    searchInput.addEventListener('input', filterLinks);

    // Clear search event
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterLinks();
        searchInput.focus();
    });


    /* ----------------------------------------------------
       KEYBOARD SHORTCUTS
    ---------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
        // Press '/' to focus search input (if not already typing in it)
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        // Press 'Esc' to clear and blur search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            filterLinks();
            searchInput.blur();
        }
    });


    /* ----------------------------------------------------
       OPEN ALL LINKS TRIGGER
    ---------------------------------------------------- */
    const openGroupLinks = (cards) => {
        let openedCount = 0;
        cards.forEach(card => {
            // Only open links that are currently visible (not filtered out by search)
            if (!card.classList.contains('hidden')) {
                window.open(card.href, '_blank');
                openedCount++;
            }
        });
        if (openedCount === 0) {
            alert('Нет видимых ссылок для открытия!');
        }
    };

    openAllGeneralBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openGroupLinks(generalCards);
    });

    openAllTeamBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openGroupLinks(teamCards);
    });

    /* ----------------------------------------------------
       LOGO FLAGS COLLAPSIBLE PANEL
    ---------------------------------------------------- */
    const flags = [
        { name: 'BD', file: 'BD-flag.png' },
        { name: 'BG', file: 'BG-flag.png' },
        { name: 'IT', file: 'IT-flag.png' },
        { name: 'LT', file: 'LT-flag.png' },
        { name: 'MY', file: 'MY-flag.png' },
        { name: 'PL', file: 'PL-flag.png' },
        { name: 'PT', file: 'PT-flag.png' },
        { name: 'RS', file: 'RS-flag.png' },
        { name: 'SI', file: 'SI-flag.png' },
        { name: 'SK', file: 'SK-flag.png' }
    ];

    const flagsGrid = document.getElementById('flags-grid');
    const flagsToggle = document.getElementById('flags-toggle');
    const flagsContainer = document.getElementById('flags-container');

    // Generate flag cards dynamically
    flags.forEach(flag => {
        const card = document.createElement('a');
        card.href = `flags/${flag.file}`;
        card.download = flag.file;
        card.className = 'flag-card';
        card.title = `Скачать флаг ${flag.name}`;
        
        card.innerHTML = `
            <img class="flag-image" src="flags/${flag.file}" alt="${flag.name} flag" loading="lazy">
            <div class="flag-meta">
                <span class="flag-name">${flag.name}</span>
                <i data-lucide="download" class="flag-download-icon"></i>
            </div>
        `;
        
        // Force download trigger (handles local server blob, local file canvas, or new tab fallback)
        card.addEventListener('click', async (e) => {
            e.preventDefault();
            const url = card.href;
            const filename = card.download;
            
            try {
                // Try fetching as Blob (works on HTTP/localhost origins)
                const response = await fetch(url);
                if (!response.ok) throw new Error('Fetch failed');
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.download = filename;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                // Fallback for file:// CORS block: try canvas conversion
                try {
                    const img = card.querySelector('.flag-image');
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/png');
                    const tempLink = document.createElement('a');
                    tempLink.href = dataUrl;
                    tempLink.download = filename;
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                } catch (canvasErr) {
                    // Ultimate fallback: open in a new tab so user can right-click and save
                    window.open(url, '_blank');
                }
            }
        });

        flagsGrid.appendChild(card);
    });

    // Re-initialize Lucide icons for the newly added download icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Toggle expand/collapse
    flagsToggle.addEventListener('click', () => {
        const isExpanded = flagsToggle.getAttribute('aria-expanded') === 'true';
        flagsToggle.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            flagsContainer.classList.remove('expanded');
            flagsContainer.classList.add('collapsed');
        } else {
            flagsContainer.classList.remove('collapsed');
            flagsContainer.classList.add('expanded');
        }
    });
});
