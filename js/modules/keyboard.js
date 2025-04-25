export class KeyboardManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.isPanning = false;
        this.selectedBoxes = new Set();
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        document.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        
        this.init();
    }

    init() {
        this.undoStack = [];
        this.redoStack = [];
    }

    handleKeyDown(event) {
        // Canvas Navigation
        if (event.ctrlKey) {
            switch (event.key) {
                case '+':
                case '=':
                    event.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                    event.preventDefault();
                    this.zoomOut();
                    break;
                case '0':
                    event.preventDefault();
                    this.resetZoom();
                    break;
                case 'f':
                case 'F':
                    event.preventDefault();
                    this.fitToScreen();
                    break;
                
                // Box Operations
                case 'd':
                case 'D':
                    event.preventDefault();
                    this.duplicateSelectedBoxes();
                    break;
                case 'a':
                case 'A':
                    event.preventDefault();
                    this.selectAllBoxes();
                    break;
                
                // File Operations
                case 's':
                case 'S':
                    event.preventDefault();
                    this.uiManager.saveSchema();
                    break;
                case 'o':
                case 'O':
                    event.preventDefault();
                    this.uiManager.loadSchema();
                    break;
                case 'n':
                case 'N':
                    event.preventDefault();
                    this.uiManager.newSchema();
                    break;
                
                // Layer Management
                case 'l':
                case 'L':
                    event.preventDefault();
                    this.uiManager.toggleLayerPanel();
                    break;
                
                // Undo/Redo
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
            }
            return;
        }

        // Box Movement
        if (event.key.startsWith('Arrow')) {
            event.preventDefault();
            const distance = event.shiftKey ? 10 : 1;
            switch (event.key) {
                case 'ArrowLeft':
                    this.moveSelectedBoxes(-distance, 0);
                    break;
                case 'ArrowRight':
                    this.moveSelectedBoxes(distance, 0);
                    break;
                case 'ArrowUp':
                    if (event.ctrlKey) {
                        this.changeBoxLayer(1);
                    } else {
                        this.moveSelectedBoxes(0, -distance);
                    }
                    break;
                case 'ArrowDown':
                    if (event.ctrlKey) {
                        this.changeBoxLayer(-1);
                    } else {
                        this.moveSelectedBoxes(0, distance);
                    }
                    break;
            }
            return;
        }

        // Other shortcuts
        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                event.preventDefault();
                this.deleteSelected();
                break;
            case 'Escape':
                event.preventDefault();
                this.deselectAll();
                break;
            case 'm':
            case 'M':
                event.preventDefault();
                this.uiManager.toggleMagnetMode();
                break;
            case 'F2':
                if (event.shiftKey) {
                    event.preventDefault();
                    this.renameSelectedBox();
                }
                break;
        }

        // Alt key combinations
        if (event.altKey) {
            switch (event.key) {
                case 'c':
                case 'C':
                    event.preventDefault();
                    this.changeBoxColor();
                    break;
            }
        }

        // Space for panning
        if (event.code === 'Space') {
            event.preventDefault();
            if (!this.isPanning) {
                this.isPanning = true;
                document.body.style.cursor = 'grab';
            }
        }
    }

    handleKeyUp(event) {
        if (event.code === 'Space') {
            this.isPanning = false;
            document.body.style.cursor = 'default';
        }
    }

    handleWheel(event) {
        if (event.ctrlKey) {
            event.preventDefault();
            
            // Zoom in or out
            if (event.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        }
    }

    // Helper methods for actions
    zoomIn() {
        if (this.uiManager && typeof this.uiManager.zoomIn === 'function') {
            this.uiManager.zoomIn();
        }
    }

    zoomOut() {
        if (this.uiManager && typeof this.uiManager.zoomOut === 'function') {
            this.uiManager.zoomOut();
        }
    }

    resetZoom() {
        this.uiManager.resetZoom();
    }

    fitToScreen() {
        this.uiManager.fitToScreen();
    }

    duplicateSelectedBoxes() {
        this.uiManager.duplicateSelectedBoxes();
    }

    selectAllBoxes() {
        this.uiManager.selectAllBoxes();
    }

    moveSelectedBoxes(dx, dy) {
        this.uiManager.moveSelectedBoxes(dx, dy);
    }

    changeBoxLayer(delta) {
        this.uiManager.changeBoxLayer(delta);
    }

    deleteSelected() {
        this.uiManager.deleteSelected();
    }

    deselectAll() {
        this.uiManager.deselectAll();
    }

    renameSelectedBox() {
        this.uiManager.renameSelectedBox();
    }

    changeBoxColor() {
        this.uiManager.changeBoxColor();
    }

    undo() {
        this.uiManager.undo();
    }

    redo() {
        this.uiManager.redo();
    }

    getScale() {
        return this.uiManager.getScale();
    }
} 