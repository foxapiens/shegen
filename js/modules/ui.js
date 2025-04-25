export class UIManager {
    constructor() {
        this.insertButton = document.getElementById('insertButton');
        this.magnetButton = document.getElementById('magnetButton');
        this.layerButton = document.getElementById('layerButton');
        this.formOverlay = document.getElementById('formOverlay');
        this.canvasContainer = document.querySelector('.canvas-container');
        this.canvas = document.getElementById('canvas');

        this.isMagnetActive = false;
        this.isLayerActive = false;
        this.deleteButton = null;
        this.selectedBoxes = new Set();
        this.undoStack = [];
        this.redoStack = [];

        this.init();
    }

    init() {
        this.magnetButton.addEventListener('click', () => this.toggleMagnetMode());
        this.layerButton.addEventListener('click', () => this.toggleLayerMode());
        this.insertButton.addEventListener('click', () => {
            this.formOverlay.classList.add('active');
            this.updatePortInputs();
        });
        this.canvasContainer.addEventListener('click', () => this.hideDeleteButton());

        // inputCount ve outputCount değiştiğinde port isim alanlarını güncelle
        document.getElementById('inputCount').addEventListener('change', () => this.updatePortInputs());
        document.getElementById('outputCount').addEventListener('change', () => this.updatePortInputs());
    }

    updatePortInputs() {
        const inputCount = parseInt(document.getElementById('inputCount').value) || 0;
        const outputCount = parseInt(document.getElementById('outputCount').value) || 0;
        const inputPortsDiv = document.getElementById('inputPorts');
        const outputPortsDiv = document.getElementById('outputPorts');
    
        // Giriş alanlarını oluştur
        inputPortsDiv.innerHTML = '';
        for (let i = 0; i < inputCount; i++) {
            inputPortsDiv.innerHTML += `
                <label for="inputPort${i}">Giriş ${i + 1} İsmi:</label>
                <input type="text" id="inputPort${i}" placeholder="Giriş ${i + 1}">
            `;
            console.log(`inputPort${i} oluşturuldu`); // Hata ayıklama
        }
    
        // Çıkış alanlarını oluştur
        outputPortsDiv.innerHTML = '';
        for (let i = 0; i < outputCount; i++) {
            outputPortsDiv.innerHTML += `
                <label for="outputPort${i}">Çıkış ${i + 1} İsmi:</label>
                <input type="text" id="outputPort${i}" placeholder="Çıkış ${i + 1}">
            `;
            console.log(`outputPort${i} oluşturuldu`);
        }
    }

    createDeleteButton() {
        if (!this.deleteButton) {
            this.deleteButton = document.createElement('div');
            this.deleteButton.className = 'delete-button';
            this.deleteButton.innerHTML = '<img src="assets/icons/trash.svg" alt="Delete" class="icon">';
            this.canvasContainer.appendChild(this.deleteButton);
        }
        return this.deleteButton;
    }

    showDeleteButton(target, x, y) {
        const btn = this.createDeleteButton();
        btn.style.left = `${x + 10}px`;
        btn.style.top = `${y - 10}px`;
        btn.classList.add('visible');

        btn.onclick = () => {
            if (target.classList && target.classList.contains('box')) {
                this.boxManager.deleteBox(target);
            } else if (target.tagName === 'path') {
                this.wireManager.deleteWire(target);
            }
            this.hideDeleteButton();
        };
    }

    hideDeleteButton() {
        if (this.deleteButton) {
            this.deleteButton.classList.remove('visible');
        }
    }

    setManagers(boxManager, wireManager, shelangManager, canvasManager) {
        this.boxManager = boxManager;
        this.wireManager = wireManager;
        this.shelangManager = shelangManager;
        this.canvasManager = canvasManager;
    }

    getMagnetActive() { return this.isMagnetActive; }
    getLayerActive() { return this.isLayerActive; }

    syncWithCanvasManager() {
        // If canvas manager is available, sync the scale with it
        if (this.canvasManager) {
            const uiScale = this.getScale();
            this.canvasManager.scale = uiScale;
            this.canvasManager.updateZoom();
        }
    }

    // Canvas operations
    zoomIn() {
        const currentScale = this.getScale();
        const newScale = currentScale * 1.1;
        this.canvas.style.transform = `scale(${newScale})`;
        this.updateZoomLevel(newScale);
        
        // Sync with canvas manager
        this.syncWithCanvasManager();
        
        // Update wires after zooming
        if (this.wireManager) {
            requestAnimationFrame(() => {
                this.wireManager.updateWires();
            });
        }
    }

    zoomOut() {
        const currentScale = this.getScale();
        const newScale = currentScale / 1.1;
        this.canvas.style.transform = `scale(${newScale})`;
        this.updateZoomLevel(newScale);
        
        // Sync with canvas manager
        this.syncWithCanvasManager();
        
        // Update wires after zooming
        if (this.wireManager) {
            requestAnimationFrame(() => {
                this.wireManager.updateWires();
            });
        }
    }

    resetZoom() {
        this.canvas.style.transform = 'scale(1)';
        this.updateZoomLevel(1);
        
        // Sync with canvas manager
        this.syncWithCanvasManager();
        
        // Update wires after zooming
        if (this.wireManager) {
            requestAnimationFrame(() => {
                this.wireManager.updateWires();
            });
        }
    }

    fitToScreen() {
        const containerRect = this.canvasContainer.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const scaleX = containerRect.width / canvasRect.width;
        const scaleY = containerRect.height / canvasRect.height;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        this.canvas.style.transform = `scale(${scale})`;
        this.updateZoomLevel(scale);
        
        // Sync with canvas manager
        this.syncWithCanvasManager();
        
        // Update wires after zooming
        if (this.wireManager) {
            requestAnimationFrame(() => {
                this.wireManager.updateWires();
            });
        }
    }

    updateZoomLevel(scale) {
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(scale * 100)}%`;
        }
    }

    getScale() {
        const transform = this.canvas.style.transform;
        if (!transform || transform === 'none') return 1;
        const match = transform.match(/scale\((.*?)\)/);
        return match ? parseFloat(match[1]) : 1;
    }

    // Box operations
    duplicateSelectedBoxes() {
        if (!this.boxManager) return;
        this.selectedBoxes.forEach(box => {
            const boxData = this.boxManager.getBoxData(box);
            this.boxManager.createBox({
                ...boxData,
                x: boxData.x + 20,
                y: boxData.y + 20
            });
        });
    }

    selectAllBoxes() {
        const boxes = document.querySelectorAll('.box');
        boxes.forEach(box => {
            this.selectedBoxes.add(box);
            box.classList.add('selected');
        });
    }

    moveSelectedBoxes(dx, dy) {
        this.selectedBoxes.forEach(box => {
            const currentX = parseFloat(box.style.left);
            const currentY = parseFloat(box.style.top);
            box.style.left = `${currentX + dx}px`;
            box.style.top = `${currentY + dy}px`;
            if (this.wireManager) {
                this.wireManager.updateWires();
            }
        });
    }

    changeBoxLayer(delta) {
        this.selectedBoxes.forEach(box => {
            const currentZIndex = parseInt(box.style.zIndex) || 0;
            box.style.zIndex = currentZIndex + delta;
        });
    }

    deleteSelected() {
        this.selectedBoxes.forEach(box => {
            if (this.boxManager) {
                this.boxManager.deleteBox(box);
            }
        });
        this.selectedBoxes.clear();
    }

    deselectAll() {
        this.selectedBoxes.forEach(box => {
            box.classList.remove('selected');
        });
        this.selectedBoxes.clear();
    }

    renameSelectedBox() {
        const selectedBox = this.selectedBoxes.values().next().value;
        if (selectedBox) {
            const title = selectedBox.querySelector('.box-header');
            if (title) {
                const newName = prompt('Enter new name:', title.textContent);
                if (newName !== null) {
                    title.textContent = newName;
                }
            }
        }
    }

    changeBoxColor() {
        const selectedBox = this.selectedBoxes.values().next().value;
        if (selectedBox) {
            const newColor = prompt('Enter new color (hex or name):', selectedBox.style.backgroundColor);
            if (newColor !== null) {
                selectedBox.style.backgroundColor = newColor;
            }
        }
    }

    // Mode toggles
    toggleMagnetMode() {
        this.isMagnetActive = !this.isMagnetActive;
        this.magnetButton.classList.toggle('active', this.isMagnetActive);
    }

    toggleLayerMode() {
        this.isLayerActive = !this.isLayerActive;
        this.layerButton.classList.toggle('active', this.isLayerActive);
    }

    // File operations
    saveSchema() {
        if (this.shelangManager) {
            this.shelangManager.saveScheme();
        }
    }

    loadSchema() {
        if (this.shelangManager) {
            this.shelangManager.loadScheme();
        }
    }

    newSchema() {
        if (confirm('Create new schema? All unsaved changes will be lost.')) {
            this.canvas.innerHTML = '';
            if (this.wireManager) {
                this.wireManager.clearWires();
            }
        }
    }

    // Undo/Redo
    undo() {
        if (this.undoStack.length > 0) {
            const action = this.undoStack.pop();
            this.redoStack.push(action);
            this.executeAction(action, true);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const action = this.redoStack.pop();
            this.undoStack.push(action);
            this.executeAction(action, false);
        }
    }

    executeAction(action, isUndo) {
        // Implementation of action execution
        // This would need to handle different types of actions
        // such as box creation, deletion, movement, etc.
    }
}