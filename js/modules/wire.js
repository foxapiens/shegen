export class WireManager {
    constructor() {
        this.wiresSvg = document.getElementById('wires');
        this.connections = [];
    }

    addPortListener(port) {
        port.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const startPort = port;
            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke', '#000');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            this.wiresSvg.appendChild(path);

            let startPos = this.getPortPosition(startPort);
            let endPos = startPos;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            const self = this;
            function onMouseMove(e) {
                endPos = { x: e.clientX, y: e.clientY };
                const midX = (startPos.x + endPos.x) / 2;
                path.setAttribute('d', `M ${startPos.x} ${startPos.y} Q ${midX} ${startPos.y}, ${midX} ${(startPos.y + endPos.y) / 2} T ${endPos.x} ${endPos.y}`);
            }

            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                const endPort = e.target.closest('.port');
                if (endPort && endPort !== startPort && endPort.dataset.type !== startPort.dataset.type) {
                    self.connections.push({ start: startPort, end: endPort, path });
                    startPort.classList.add('connected');
                    endPort.classList.add('connected');
                    path.addEventListener('click', (e) => {
                        const midX = (self.getPortPosition(startPort).x + self.getPortPosition(endPort).x) / 2;
                        const midY = (self.getPortPosition(startPort).y + self.getPortPosition(endPort).y) / 2;
                        self.uiManager.showDeleteButton(path, midX, midY);
                        e.stopPropagation();
                    });
                } else {
                    self.wiresSvg.removeChild(path);
                }
                self.updateWires();
            }
        });
    }

    getPortPosition(port) {
        if (!port || !port.closest) {
            console.error("Invalid port in getPortPosition:", port);
            return { x: 0, y: 0 };
        }
        
        const box = port.closest('.box');
        if (!box) {
            console.error("Port not inside a box:", port);
            return { x: 0, y: 0 };
        }
        
        const containerRect = this.wiresSvg.closest('.canvas-container').getBoundingClientRect();
        const baseLeft = parseFloat(box.dataset.baseLeft);
        const baseTop = parseFloat(box.dataset.baseTop);
        const portRect = port.getBoundingClientRect();

        // Get scale and translation values
        const scale = this.getCurrentScale();
        const translateX = this.canvasManager ? this.canvasManager.getTranslateX() : 0;
        const translateY = this.canvasManager ? this.canvasManager.getTranslateY() : 0;
        
        // Calculate port position relative to canvas
        const portOffsetX = (portRect.left - containerRect.left - translateX) / scale - baseLeft;
        const portOffsetY = (portRect.top - containerRect.top - translateY) / scale - baseTop;

        const portX = baseLeft + portOffsetX;
        const portY = baseTop + portOffsetY;

        return {
            x: portX * scale + translateX,
            y: portY * scale + translateY
        };
    }

    updateWires() {
        // Get the current scale
        const currentScale = this.getCurrentScale();
        
        this.connections.forEach(connection => {
            try {
                const startPos = this.getPortPosition(connection.start);
                const endPos = this.getPortPosition(connection.end);
                const midX = (startPos.x + endPos.x) / 2;
                connection.path.setAttribute('d', `M ${startPos.x} ${startPos.y} Q ${midX} ${startPos.y}, ${midX} ${(startPos.y + endPos.y) / 2} T ${endPos.x} ${endPos.y}`);
            } catch (error) {
                console.error("Error updating wire:", error);
            }
        });
    }

    /**
     * Create a wire connection between two ports
     * @param {HTMLElement} sourcePort The source port (output)
     * @param {HTMLElement} targetPort The target port (input)
     * @returns {SVGPathElement} The created wire path
     */
    createWire(sourcePort, targetPort) {
        if (!sourcePort || !targetPort) {
            console.error("Invalid ports provided to createWire", { sourcePort, targetPort });
            return null;
        }
        
        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        this.wiresSvg.appendChild(path);

        // Add path to connections
        this.connections.push({ 
            start: sourcePort, 
            end: targetPort, 
            path 
        });

        // Mark ports as connected
        sourcePort.classList.add('connected');
        targetPort.classList.add('connected');

        // Add click listener for deletion
        path.addEventListener('click', (e) => {
            const startPos = this.getPortPosition(sourcePort);
            const endPos = this.getPortPosition(targetPort);
            const midX = (startPos.x + endPos.x) / 2;
            const midY = (startPos.y + endPos.y) / 2;
            this.uiManager.showDeleteButton(path, midX, midY);
            e.stopPropagation();
        });

        // Update path position
        const startPos = this.getPortPosition(sourcePort);
        const endPos = this.getPortPosition(targetPort);
        const midX = (startPos.x + endPos.x) / 2;
        path.setAttribute('d', `M ${startPos.x} ${startPos.y} Q ${midX} ${startPos.y}, ${midX} ${(startPos.y + endPos.y) / 2} T ${endPos.x} ${endPos.y}`);

        return path;
    }

    deleteWire(path) {
        this.connections = this.connections.filter(conn => {
            if (conn.path === path) {
                conn.start.classList.remove('connected');
                conn.end.classList.remove('connected');
                path.remove();
                return false;
            }
            return true;
        });
    }

    deleteBoxWires(box) {
        this.connections = this.connections.filter(conn => {
            if (conn.start.closest('.box') === box || conn.end.closest('.box') === box) {
                conn.start.classList.remove('connected');
                conn.end.classList.remove('connected');
                conn.path.remove();
                return false;
            }
            return true;
        });
    }

    clearAllWires() {
        this.connections.forEach(conn => {
            conn.start.classList.remove('connected');
            conn.end.classList.remove('connected');
            conn.path.remove();
        });
        this.connections = [];
    }

    getWires() {
        return this.connections.map(conn => {
            const sourceBox = conn.start.closest('.box');
            const targetBox = conn.end.closest('.box');
            return {
                source: {
                    boxId: sourceBox.id,
                    portIndex: parseInt(conn.start.dataset.index)
                },
                target: {
                    boxId: targetBox.id,
                    portIndex: parseInt(conn.end.dataset.index)
                },
                path: conn.path
            };
        });
    }

    setManagers(canvasManager, uiManager) {
        this.canvasManager = canvasManager;
        this.uiManager = uiManager;
    }

    /**
     * Diagnose connection issues
     * Helps identify problems with connections
     */
    diagWires() {
        console.log("Wire Diagnostics:");
        console.log(`Total connections: ${this.connections.length}`);
        
        this.connections.forEach((conn, idx) => {
            const sourceBox = conn.start.closest('.box');
            const targetBox = conn.end.closest('.box');
            
            console.log(`Connection ${idx}:`, {
                sourceBoxId: sourceBox?.id,
                sourcePortIndex: conn.start.dataset.index,
                targetBoxId: targetBox?.id,
                targetPortIndex: conn.end.dataset.index,
                sourceVisible: conn.start.offsetParent !== null,
                targetVisible: conn.end.offsetParent !== null
            });
        });
        
        // Check for detached boxes
        const boxes = document.querySelectorAll('.box');
        console.log(`Total boxes: ${boxes.length}`);
        
        boxes.forEach(box => {
            const inputPorts = box.querySelectorAll('.port[data-type="input"]');
            const outputPorts = box.querySelectorAll('.port[data-type="output"]');
            
            console.log(`Box ${box.id}:`, {
                inputPorts: inputPorts.length,
                outputPorts: outputPorts.length,
                isInDOM: box.offsetParent !== null
            });
        });
    }

    getCurrentScale() {
        // Try to get scale from canvas manager first
        if (this.canvasManager && typeof this.canvasManager.getScale === 'function') {
            return this.canvasManager.getScale();
        }
        
        // Fall back to UI manager if available
        if (this.uiManager && typeof this.uiManager.getScale === 'function') {
            return this.uiManager.getScale();
        }
        
        // Default to 1 if no manager available
        return 1;
    }
}