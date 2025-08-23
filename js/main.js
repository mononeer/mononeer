document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();

    if (document.getElementById('unified-gallery-container')) {
        buildUnifiedGallery();
    }
});

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchContext = document.querySelector('main');

    if (!searchInput || !searchContext) return;

    function performSearch() {
        const keyword = searchInput.value;
        const markInstance = new Mark(searchContext);

        markInstance.unmark({
            done: () => {
                if (keyword.length > 1) {
                    markInstance.mark(keyword, {
                        separateWordSearch: true,
                        accuracy: "partially"
                    });
                }
            }
        });
    }

    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });
}

async function buildUnifiedGallery() {
    const container = document.getElementById('unified-gallery-container');
    container.innerHTML = '<p>Loading content...</p>';

    const staticContent = [
        {
            type: 'Game',
            name: 'Chess',
            description: 'A classic game of strategy with a simple AI opponent.',
            url: '/games/chess/'
        },
        {
            type: 'Game',
            name: 'Tic-Tac-Toe',
            description: 'A classic game of X\'s and O\'s.',
            url: '/games/tictactoe/'
        },
        {
            type: 'App',
            name: 'Calculator',
            description: 'A simple and stylish calculator app.',
            url: '/games/calculator/'
        },
        {
            type: 'App',
            name: 'Todo List',
            description: 'A useful app to keep track of your tasks.',
            url: '/games/todo/'
        },
        {
            type: 'App',
            name: 'Markdown Editor',
            description: 'A real-time Markdown previewer for developers.',
            url: '/games/markdown/'
        }
    ];

    try {
        const response = await fetch('https://api.github.com/users/mononeer/repos?sort=pushed&per_page=8');
        if (!response.ok) throw new Error('Could not fetch projects');
        const projects = await response.json();

        const githubProjects = projects.map(project => ({
            type: 'Project',
            name: project.name,
            description: project.description || 'No description available.',
            url: `/project-detail/?repo=${project.name}`,
            language: project.language,
            stars: project.stargazers_count
        }));

        const allContent = [...githubProjects, ...staticContent];

        // Render the gallery
        renderGallery(allContent);

    } catch (error) {
        console.error('Error building unified gallery:', error);
        // If GitHub fails, render static content anyway
        renderGallery(staticContent);
    }
}

function renderGallery(content) {
    const container = document.getElementById('unified-gallery-container');
    container.innerHTML = '';
    container.classList.add('gallery-container');

    content.forEach((item, index) => {
        const itemEl = document.createElement('a');
        itemEl.href = item.url;
        itemEl.classList.add('gallery-item');

        let footerHTML = '';
        if (item.type === 'Project') {
            footerHTML = `
                <div class="project-footer">
                    <span>${item.language || ''}</span>
                    <span>⭐ ${item.stars}</span>
                </div>
            `;
        }

        itemEl.innerHTML = `
            <span class="gallery-item-type">${item.type}</span>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            ${footerHTML}
        `;
        itemEl.style.animationDelay = `${index * 100}ms`; // Stagger delay
        container.appendChild(itemEl);
    });
}
