export class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvasContainer = document.querySelector('.canvas-container');
        this.zoomInButton = document.getElementById('zoomIn');
        this.zoomOutButton = document.getElementById('zoomOut');
        this.zoomLevelDisplay = document.getElementById('zoomLevel');

        this.scale = 1;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.canvasWidth = 2000;
        this.canvasHeight = 2000;
        this.gridSize = 25;

        this.canvas.style.width = `${this.canvasWidth}px`;
        this.canvas.style.height = `${this.canvasHeight}px`;

        this.init();
    }

    init() {
        this.canvasContainer.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvasContainer.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvasContainer.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvasContainer.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        this.zoomInButton.addEventListener('click', this.zoomIn.bind(this));
        this.zoomOutButton.addEventListener('click', this.zoomOut.bind(this));
        document.getElementById('fitScreen').addEventListener('click', this.fitToScreen.bind(this));
    }

    handleMouseDown(e) {
        if (e.target === this.canvas || e.target === this.canvasContainer) {
            this.isDragging = true;
            this.canvas.classList.add('dragging');
            this.startX = e.clientX - this.translateX;
            this.startY = e.clientY - this.translateY;
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const newTranslateX = e.clientX - this.startX;
            const newTranslateY = e.clientY - this.startY;
            const containerRect = this.canvasContainer.getBoundingClientRect();
            const maxTranslateX = 0;
            const maxTranslateY = 0;
            const minTranslateX = -(this.canvasWidth * this.scale - containerRect.width);
            const minTranslateY = -(this.canvasHeight * this.scale - containerRect.height);

            this.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, newTranslateX));
            this.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, newTranslateY));

            this.updateTransform();
            if (this.wireManager) this.wireManager.updateWires(); // Kabloları güncelle
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.classList.remove('dragging');
    }

    zoomIn() {
        this.scale += 0.1;
        this.updateZoom();
    }

    zoomOut() {
        this.scale = Math.max(0.1, this.scale - 0.1);
        this.updateZoom();
    }

    resetZoom() {
        this.scale = 1;
        this.updateZoom();
    }

    updateZoom() {
        this.updateTransform();
        this.zoomLevelDisplay.textContent = `${Math.round(this.scale * 100)}%`;
        if (this.wireManager) this.wireManager.updateWires();
    }

    updateTransform() {
        this.canvas.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        if (this.boxManager) {
            const boxes = document.querySelectorAll('.box');
            boxes.forEach(box => {
                const baseLeft = parseFloat(box.dataset.baseLeft);
                const baseTop = parseFloat(box.dataset.baseTop);
                box.style.left = `${baseLeft}px`;
                box.style.top = `${baseTop}px`;
            });
        }
    }

    expandCanvasIfNeeded(box) {
        const baseLeft = parseFloat(box.dataset.baseLeft);
        const baseTop = parseFloat(box.dataset.baseTop);
        const boxRight = baseLeft + box.offsetWidth / this.scale;
        const boxBottom = baseTop + box.offsetHeight / this.scale;
        const boxes = document.querySelectorAll('.box');

        if (baseLeft < 0) {
            const expandAmount = Math.abs(Math.floor(baseLeft / this.gridSize) * this.gridSize) + this.gridSize;
            this.canvasWidth += expandAmount;
            const deltaX = expandAmount;
            this.translateX += deltaX * this.scale;
            boxes.forEach(b => {
                b.dataset.baseLeft = parseFloat(b.dataset.baseLeft) + deltaX;
                b.style.left = `${b.dataset.baseLeft}px`;
            });
            this.canvas.style.width = `${this.canvasWidth}px`;
        }

        if (baseTop < 0) {
            const expandAmount = Math.abs(Math.floor(baseTop / this.gridSize) * this.gridSize) + this.gridSize;
            this.canvasHeight += expandAmount;
            const deltaY = expandAmount;
            this.translateY += deltaY * this.scale;
            boxes.forEach(b => {
                b.dataset.baseTop = parseFloat(b.dataset.baseTop) + deltaY;
                b.style.top = `${b.dataset.baseTop}px`;
            });
            this.canvas.style.height = `${this.canvasHeight}px`;
        }

        if (boxRight > this.canvasWidth) {
            this.canvasWidth = Math.ceil(boxRight / this.gridSize) * this.gridSize + this.gridSize;
            this.canvas.style.width = `${this.canvasWidth}px`;
        }

        if (boxBottom > this.canvasHeight) {
            this.canvasHeight = Math.ceil(boxBottom / this.gridSize) * this.gridSize + this.gridSize;
            this.canvas.style.height = `${this.canvasHeight}px`;
        }

        requestAnimationFrame(() => {
            this.updateTransform();
            if (this.wireManager) this.wireManager.updateWires();
        });
    }

    setManagers(wireManager, boxManager) {
        this.wireManager = wireManager;
        this.boxManager = boxManager;
    }

    getScale() { return this.scale; }
    getTranslateX() { return this.translateX; }
    getTranslateY() { return this.translateY; }
    getGridSize() { return this.gridSize; }

    fitToScreen() {
        const containerRect = this.canvasContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const scaleX = containerWidth / this.canvasWidth;
        const scaleY = containerHeight / this.canvasHeight;
        this.scale = Math.min(scaleX, scaleY) * 0.9; // 90% of the container size for padding
        
        this.translateX = (containerWidth - this.canvasWidth * this.scale) / 2;
        this.translateY = (containerHeight - this.canvasHeight * this.scale) / 2;
        
        this.updateZoom();
    }
}