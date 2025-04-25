import { CanvasManager } from './modules/canvas.js';
import { UIManager } from './modules/ui.js';
import { BoxManager } from './modules/box.js';
import { WireManager } from './modules/wire.js';
import { SheLangManager } from './modules/shelang.js';
import { KeyboardManager } from './modules/keyboard.js';
import { ShortcutsPage } from './modules/shortcutsPage.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasManager();
    const wireManager = new WireManager();
    const uiManager = new UIManager();
    const boxManager = new BoxManager();

    // Initialize SheLang manager
    const shelangManager = new SheLangManager(boxManager, wireManager, canvasManager);

    // Connect module dependencies
    canvasManager.setManagers(wireManager, boxManager);
    uiManager.setManagers(boxManager, wireManager, shelangManager, canvasManager);
    boxManager.setManagers(canvasManager, wireManager, uiManager);
    wireManager.setManagers(canvasManager, uiManager);
    
    // Initialize keyboard manager
    const keyboardManager = new KeyboardManager(uiManager);

    // Variable to track if ShortcutsPage has been initialized
    let shortcutsPageInitialized = false;
    let shortcutsPage = null;

    // Sidebar navigation
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    const contents = document.querySelectorAll('.content');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            contents.forEach(content => content.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            
            // Initialize ShortcutsPage only when the shortcut page is clicked
            if (page === 'shortcut' && !shortcutsPageInitialized) {
                shortcutsPage = new ShortcutsPage();
                shortcutsPageInitialized = true;
            }
        });
    });
    document.getElementById('home').classList.add('active');
});