import { KEYBOARD_SHORTCUTS } from './shortcuts.js';

export class ShortcutsPage {
    constructor() {
        this.container = document.getElementById('shortcutsGrid');
        this.shortcutsContainer = document.querySelector('.shortcuts-container');
        this.init();
    }

    init() {
        // Clear any existing content first
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.renderShortcuts();
        this.addSearchFilter();
    }

    // Category icons mapping
    getCategoryIcon(category) {
        const icons = {
            "Canvas Navigation": "fa-arrows-alt",
            "Box Operations": "fa-object-group",
            "Wire Operations": "fa-project-diagram",
            "File Operations": "fa-file-alt",
            "View Operations": "fa-eye",
            "Box Editing": "fa-edit",
            "Multi-Selection Operations": "fa-object-ungroup",
            "Port Operations": "fa-plug",
            "Undo/Redo": "fa-history"
        };
        return icons[category] || "fa-keyboard";
    }

    renderShortcuts() {
        if (!this.container) return;
        
        // Remove any existing search container
        const existingSearch = document.querySelector('.shortcuts-search-container');
        if (existingSearch) {
            existingSearch.remove();
        }
        
        // Create a search input
        const searchContainer = document.createElement('div');
        searchContainer.className = 'shortcuts-search-container';
        searchContainer.innerHTML = `
            <div class="shortcuts-search">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="shortcutsSearch" placeholder="Search shortcuts..." class="shortcuts-search-input">
            </div>
        `;
        
        if (this.shortcutsContainer) {
            this.shortcutsContainer.insertBefore(searchContainer, this.container);
        }

        Object.entries(KEYBOARD_SHORTCUTS).forEach(([category, shortcuts]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'shortcut-category';
            categoryElement.dataset.category = category.toLowerCase();
            
            categoryElement.innerHTML = `
                <h2><i class="fas ${this.getCategoryIcon(category)}"></i> ${category}</h2>
                <div class="shortcut-items">
                    ${Object.entries(shortcuts)
                        .map(([key, description]) => `
                            <div class="shortcut-item" data-key="${key.toLowerCase()}" data-description="${description.toLowerCase()}">
                                <span class="shortcut-key">${this.formatKeyboardShortcut(key)}</span>
                                <span class="shortcut-description">${description}</span>
                            </div>
                        `)
                        .join('')}
                </div>
            `;
            
            this.container.appendChild(categoryElement);
        });
    }

    // Format keyboard shortcuts with spans for better styling
    formatKeyboardShortcut(shortcut) {
        // Special handling for keys with plus signs
        if (shortcut.includes('+')) {
            return shortcut.split('+').map(part => part.trim()).join('<span class="key-separator">+</span>');
        }
        return shortcut;
    }

    // Add search functionality
    addSearchFilter() {
        const searchInput = document.getElementById('shortcutsSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const categories = document.querySelectorAll('.shortcut-category');

            categories.forEach(category => {
                const items = category.querySelectorAll('.shortcut-item');
                let hasVisibleItems = false;

                items.forEach(item => {
                    const key = item.dataset.key;
                    const description = item.dataset.description;
                    const isVisible = key.includes(searchTerm) || description.includes(searchTerm);
                    
                    item.style.display = isVisible ? 'flex' : 'none';
                    if (isVisible) hasVisibleItems = true;
                });

                category.style.display = hasVisibleItems ? 'block' : 'none';
            });
        });
    }
} 