import { getRandomColor, checkCollision } from './utils.js';

export class BoxManager {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvasContainer = document.querySelector('.canvas-container');
        this.formOverlay = document.getElementById('formOverlay');
        this.addBoxButton = document.getElementById('addBoxButton');

        this.init();
    }

    init() {
        this.addBoxButton.addEventListener('click', () => this.addBox());
    }

    addBox() {
        const title = document.getElementById('boxTitle').value;
        const description = document.getElementById('boxDescription').value;
        const inputCount = parseInt(document.getElementById('inputCount').value);
        const outputCount = parseInt(document.getElementById('outputCount').value);
        
        // Get input and output port names
        const inputPorts = document.getElementById('inputPorts');
        const outputPorts = document.getElementById('outputPorts');
        
        const inputNames = [];
        const outputNames = [];
        
        if (inputPorts) {
            const inputNameInputs = inputPorts.querySelectorAll('input');
            inputNameInputs.forEach(input => inputNames.push(input.value || `Input ${input.dataset.index}`));
        }
        
        if (outputPorts) {
            const outputNameInputs = outputPorts.querySelectorAll('input');
            outputNameInputs.forEach(input => outputNames.push(input.value || `Output ${input.dataset.index}`));
        }
        
        // Create the box with default position
        this.createBox({
            title,
            description,
            inputCount,
            outputCount,
            inputNames,
            outputNames
        });
        
        // Close and reset the form
        this.formOverlay.classList.remove('active');
        document.getElementById('boxTitle').value = '';
        document.getElementById('boxDescription').value = '';
        document.getElementById('inputCount').value = '0';
        document.getElementById('outputCount').value = '0';
        document.getElementById('inputPorts').innerHTML = '';
        document.getElementById('outputPorts').innerHTML = '';
    }
    
    createBox(options = {}) {
        const { 
            title = '',
            description = '',
            inputCount = 0,
            outputCount = 0,
            inputNames = [],
            outputNames = [],
            x = null,
            y = null,
            backgroundColor = null
        } = options;
        
        const box = document.createElement('div');
        box.className = 'box';
        box.id = Date.now().toString();
        
        if (backgroundColor) {
            box.style.backgroundColor = backgroundColor;
        } else {
            box.style.backgroundColor = getRandomColor();
        }
        
        let portsHTML = '<div class="ports">';
        
        // Generate input ports
        for (let i = 0; i < inputCount; i++) {
            const portName = inputNames[i] || `Input ${i}`;
            portsHTML += `
                <div class="port-row input-row">
                    <div class="port" data-type="input" data-index="${i}"></div>
                    <span class="port-name">${portName}</span>
                    <span class="port-type">IN</span>
                </div>
            `;
        }
        
        // Generate output ports
        for (let i = 0; i < outputCount; i++) {
            const portName = outputNames[i] || `Output ${i}`;
            portsHTML += `
                <div class="port-row output-row">
                    <span class="port-type">OUT</span>
                    <span class="port-name">${portName}</span>
                    <div class="port" data-type="output" data-index="${i}"></div>
                </div>
            `;
        }
        
        portsHTML += '</div>';
        
        box.innerHTML = `
            <div class="title">${title || 'Box'}</div>
            <div class="description">${description || 'No description'}</div>
            ${portsHTML}
        `;
        
        // Set box position
        const containerRect = this.canvasContainer.getBoundingClientRect();
        
        let newX, newY;
        
        if (x !== null && y !== null) {
            // Use provided position
            newX = x;
            newY = y;
        } else {
            // Calculate center position
            const centerX = (containerRect.width / 2 - this.canvasManager.getTranslateX()) / this.canvasManager.getScale();
            const centerY = (containerRect.height / 2 - this.canvasManager.getTranslateY()) / this.canvasManager.getScale();
            const boxWidth = 200;
            const boxHeight = 100; // Approximate height
            
            newX = centerX - boxWidth / 2;
            newY = centerY - boxHeight / 2;
            
            // Check for collisions if layer is active
            if (this.uiManager.getLayerActive()) {
                let attempts = 0;
                while (checkCollision(box, newX, newY, this.canvasManager.getScale()) && attempts < 10) {
                    newX += this.canvasManager.getGridSize();
                    newY += this.canvasManager.getGridSize();
                    attempts++;
                }
            }
        }
        
        box.dataset.baseLeft = newX;
        box.dataset.baseTop = newY;
        box.style.left = `${newX}px`;
        box.style.top = `${newY}px`;
        
        this.canvas.appendChild(box);
        
        // Add port listeners for wire connections
        const ports = box.querySelectorAll('.port');
        ports.forEach(port => this.wireManager.addPortListener(port));
        
        // Add box event listeners (drag, click, etc.)
        this.addBoxListeners(box);
        
        return box;
    }

    addBoxListeners(box) {
        let isBoxDragging = false;
        let boxStartX, boxStartY, initialBaseLeft, initialBaseTop;

        box.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port')) return;
            isBoxDragging = true;
            initialBaseLeft = parseFloat(box.dataset.baseLeft);
            initialBaseTop = parseFloat(box.dataset.baseTop);
            boxStartX = e.clientX;
            boxStartY = e.clientY;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (isBoxDragging) {
                const deltaX = (e.clientX - boxStartX) / this.canvasManager.getScale();
                const deltaY = (e.clientY - boxStartY) / this.canvasManager.getScale();
                let newBaseX = initialBaseLeft + deltaX;
                let newBaseY = initialBaseTop + deltaY;

                if (this.uiManager.getMagnetActive()) {
                    newBaseX = Math.round(newBaseX / this.canvasManager.getGridSize()) * this.canvasManager.getGridSize();
                    newBaseY = Math.round(newBaseY / this.canvasManager.getGridSize()) * this.canvasManager.getGridSize();
                }

                if (this.uiManager.getLayerActive() && checkCollision(box, newBaseX, newBaseY, this.canvasManager.getScale())) {
                    return;
                }

                box.dataset.baseLeft = newBaseX;
                box.dataset.baseTop = newBaseY;
                box.style.left = `${newBaseX}px`;
                box.style.top = `${newBaseY}px`;

                this.wireManager.updateWires();

                if (this.uiManager.deleteButton && this.uiManager.deleteButton.classList.contains('visible')) {
                    const rect = box.getBoundingClientRect();
                    const containerRect = this.canvasContainer.getBoundingClientRect();
                    this.uiManager.deleteButton.style.left = `${rect.right - containerRect.left + 10}px`;
                    this.uiManager.deleteButton.style.top = `${rect.top - containerRect.top - 10}px`;
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isBoxDragging) {
                isBoxDragging = false;
                this.canvasManager.expandCanvasIfNeeded(box);
            }
        });

        box.addEventListener('click', (e) => {
            if (!isBoxDragging) {
                const rect = box.getBoundingClientRect();
                const containerRect = this.canvasContainer.getBoundingClientRect();
                this.uiManager.showDeleteButton(box, rect.right - containerRect.left, rect.top - containerRect.top);
                e.stopPropagation();
            }
        });
    }

    deleteBox(box) {
        this.wireManager.deleteBoxWires(box);
        box.remove();
    }

    clearAllBoxes() {
        const boxes = Array.from(this.canvas.querySelectorAll('.box'));
        boxes.forEach(box => {
            this.deleteBox(box);
        });
    }

    setManagers(canvasManager, wireManager, uiManager) {
        this.canvasManager = canvasManager;
        this.wireManager = wireManager;
        this.uiManager = uiManager;
    }
}