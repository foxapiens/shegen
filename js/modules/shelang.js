/**
 * Module for handling SheLang export and import
 */
export class SheLangManager {
    constructor(boxManager, wireManager, canvasManager) {
        this.boxManager = boxManager;
        this.wireManager = wireManager;
        this.canvasManager = canvasManager;
        
        // Initialize event listeners
        this.init();
    }
    
    init() {
        // Toggle menu popup when clicking the burger menu
        const globalMenu = document.querySelector('.global-menu');
        const menuPopup = document.getElementById('menuPopup');
        
        globalMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            menuPopup.classList.toggle('active');
        });
        
        // Close popup when clicking outside
        document.addEventListener('click', () => {
            menuPopup.classList.remove('active');
        });
        
        // Save button click event
        document.getElementById('saveSchemeBtn').addEventListener('click', () => {
            this.saveScheme();
        });
        
        // Load button click event
        document.getElementById('loadSchemeBtn').addEventListener('click', () => {
            this.loadScheme();
        });
    }
    
    /**
     * Generate SheLang code from the current canvas state
     * @returns {string} SheLang code
     */
    generateSheLangCode() {
        const boxes = document.querySelectorAll('.box');
        const wires = this.wireManager.getWires();
        
        let shelangCode = '# SHELANG Scheme File\n';
        shelangCode += '# Created with SHEGEN Canvas Editor\n\n';
        
        shelangCode += 'WINDOW * {\n';
        shelangCode += '    name: "main_win",\n';
        shelangCode += '    type: "web browser",\n';
        shelangCode += '    title: "SHEGEN"\n';
        shelangCode += '}\n\n';
        
        shelangCode += 'PAGE * {\n';
        shelangCode += '    name: "main_page",\n';
        shelangCode += '    decoration: {fill-both, expand-both},\n';
        shelangCode += '    layout: "absolute"\n';
        shelangCode += '}\n\n';
        
        shelangCode += 'CANVAS * {\n';
        shelangCode += '    name: "main_canvas",\n';
        shelangCode += `    width: "${this.canvasManager.canvasWidth}px",\n`;
        shelangCode += `    height: "${this.canvasManager.canvasHeight}px",\n`;
        shelangCode += '    decoration: {align: center}\n';
        shelangCode += '}\n\n';
        
        // Add boxes
        boxes.forEach((box, index) => {
            const id = box.id;
            const title = box.querySelector('.title').textContent;
            const description = box.querySelector('.description').textContent;
            const baseLeft = parseFloat(box.dataset.baseLeft);
            const baseTop = parseFloat(box.dataset.baseTop);
            const backgroundColor = box.style.backgroundColor;
            
            // Get input and output ports with their names
            const inputPorts = Array.from(box.querySelectorAll('.port-row.input-row'));
            const outputPorts = Array.from(box.querySelectorAll('.port-row.output-row'));
            
            const inputNames = inputPorts.map(portRow => 
                portRow.querySelector('.port-name').textContent
            );
            
            const outputNames = outputPorts.map(portRow => 
                portRow.querySelector('.port-name').textContent
            );
            
            shelangCode += 'FRAME * {\n';
            shelangCode += `    name: "box_${id}",\n`;
            shelangCode += `    title: "${title}",\n`;
            shelangCode += `    description: "${description}",\n`;
            shelangCode += `    position: {x: ${baseLeft}, y: ${baseTop}},\n`;
            shelangCode += `    background: "${backgroundColor}",\n`;
            shelangCode += `    input_ports: ${inputPorts.length},\n`;
            shelangCode += `    output_ports: ${outputPorts.length},\n`;
            
            // Add input port names
            if (inputNames.length > 0) {
                shelangCode += '    input_names: [\n';
                inputNames.forEach((name, idx) => {
                    shelangCode += `        "${name}"${idx < inputNames.length - 1 ? ',' : ''}\n`;
                });
                shelangCode += '    ],\n';
            }
            
            // Add output port names
            if (outputNames.length > 0) {
                shelangCode += '    output_names: [\n';
                outputNames.forEach((name, idx) => {
                    shelangCode += `        "${name}"${idx < outputNames.length - 1 ? ',' : ''}\n`;
                });
                shelangCode += '    ],\n';
            }
            
            // Remove trailing comma if necessary
            shelangCode = shelangCode.trim();
            if (shelangCode.endsWith(',')) {
                shelangCode = shelangCode.slice(0, -1) + '\n';
            } else {
                shelangCode += '\n';
            }
            
            shelangCode += '}\n\n';
        });
        
        // Add wires/connections
        wires.forEach((wire, index) => {
            const sourceId = wire.source.boxId;
            const sourcePortIndex = wire.source.portIndex;
            const targetId = wire.target.boxId;
            const targetPortIndex = wire.target.portIndex;
            
            shelangCode += 'CONTROL * {\n';
            shelangCode += `    name: "wire_${index}",\n`;
            shelangCode += `    type: "connection",\n`;
            shelangCode += `    source: {box: "box_${sourceId}", port: ${sourcePortIndex}},\n`;
            shelangCode += `    target: {box: "box_${targetId}", port: ${targetPortIndex}}\n`;
            shelangCode += '}\n\n';
        });
        
        // Add custom metadata section
        shelangCode += 'VARIABLE * {\n';
        shelangCode += '    name: "metadata",\n';
        shelangCode += '    type: "object",\n';
        shelangCode += '    value: {\n';
        shelangCode += `        "timestamp": "${new Date().toISOString()}",\n`;
        shelangCode += '        "version": "1.0",\n';
        shelangCode += '        "editor": "SHEGEN Canvas"\n';
        shelangCode += '    }\n';
        shelangCode += '}\n\n';
        
        return shelangCode;
    }
    
    /**
     * Save the current canvas state as a SheLang file
     */
    saveScheme() {
        const shelangCode = this.generateSheLangCode();
        
        try {
            // For browsers that support the File System Access API
            if ('showSaveFilePicker' in window) {
                this.saveWithFilePicker(shelangCode);
            } else {
                // Fallback for browsers that don't support the File System Access API
                this.saveWithDownload(shelangCode);
            }
        } catch (error) {
            console.error('Error saving file:', error);
            // Fallback to download method
            this.saveWithDownload(shelangCode);
        }
    }
    
    /**
     * Save using the File System Access API (modern browsers)
     * @param {string} content Content to save
     */
    async saveWithFilePicker(content) {
        try {
            const options = {
                suggestedName: 'scheme.shelang',
                types: [{
                    description: 'SheLang Files',
                    accept: {'text/plain': ['.shelang']}
                }]
            };
            
            const fileHandle = await window.showSaveFilePicker(options);
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (error) {
            console.error('Error with File System Access API:', error);
            // Fallback to download method if there's an error
            this.saveWithDownload(content);
        }
    }
    
    /**
     * Save using download link (fallback method)
     * @param {string} content Content to save
     */
    saveWithDownload(content) {
        // Create a Blob with the SheLang code
        const blob = new Blob([content], { type: 'text/plain' });
        
        // Create a temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'scheme.shelang';
        
        // Trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    
    /**
     * Load a SheLang file and render it on the canvas
     */
    loadScheme() {
        try {
            // For browsers that support the File System Access API
            if ('showOpenFilePicker' in window) {
                this.loadWithFilePicker();
            } else {
                // Fallback for browsers that don't support the File System Access API
                this.loadWithFileInput();
            }
        } catch (error) {
            console.error('Error loading file:', error);
            // Fallback to file input method
            this.loadWithFileInput();
        }
    }
    
    /**
     * Load using the File System Access API (modern browsers)
     */
    async loadWithFilePicker() {
        try {
            const options = {
                types: [{
                    description: 'SheLang Files',
                    accept: {'text/plain': ['.shelang']}
                }],
                multiple: false
            };
            
            const [fileHandle] = await window.showOpenFilePicker(options);
            const file = await fileHandle.getFile();
            const shelangCode = await file.text();
            
            this.parseAndRenderSheLang(shelangCode);
        } catch (error) {
            console.error('Error with File System Access API:', error);
            // Fallback to file input method if there's an error
            this.loadWithFileInput();
        }
    }
    
    /**
     * Load using file input element (fallback method)
     */
    loadWithFileInput() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.shelang';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const shelangCode = event.target.result;
                this.parseAndRenderSheLang(shelangCode);
            };
            
            reader.readAsText(file);
        });
        
        // Trigger the file dialog
        fileInput.click();
    }
    
    /**
     * Parse SheLang code and render it on the canvas
     * @param {string} shelangCode The SheLang code to parse
     */
    parseAndRenderSheLang(shelangCode) {
        try {
            console.log("Parsing SheLang code:", shelangCode.substring(0, 100) + "...");
            
            // Display raw content for debugging
            console.log("Raw file content sample:");
            const lines = shelangCode.split('\n');
            for (let i = 0; i < Math.min(30, lines.length); i++) {
                console.log(`Line ${i+1}: ${lines[i]}`);
            }
            
            // Clear existing canvas content
            this.boxManager.clearAllBoxes();
            this.wireManager.clearAllWires();

            // First, try a more direct approach by splitting the file into blocks
            console.log("Attempting alternative parsing approach...");
            
            // Find all blocks between { and matching }
            let blocks = [];
            let currentBlock = "";
            let braceCount = 0;
            let inBlock = false;
            let blockType = "";
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Detect block start
                if (line.includes("* {") && !inBlock) {
                    // Extract block type (WINDOW, FRAME, etc.)
                    blockType = line.split("*")[0].trim();
                    inBlock = true;
                    braceCount = 1;
                    currentBlock = blockType + " * {";
                    continue;
                }
                
                if (inBlock) {
                    // Count braces to handle nested blocks
                    braceCount += (line.match(/{/g) || []).length;
                    braceCount -= (line.match(/}/g) || []).length;
                    
                    currentBlock += "\n" + line;
                    
                    // Detect block end
                    if (braceCount === 0) {
                        blocks.push({ type: blockType, content: currentBlock });
                        inBlock = false;
                        currentBlock = "";
                    }
                }
            }
            
            console.log(`Found ${blocks.length} blocks`);
            
            // Process frame blocks
            const boxes = {};
            const frameBlocks = blocks.filter(block => block.type === "FRAME");
            
            console.log(`Found ${frameBlocks.length} frame blocks`);
            
            frameBlocks.forEach((frameBlock, index) => {
                console.log(`Processing frame ${index+1}:`, frameBlock.content.substring(0, 100) + "...");
                
                // Extract properties individually
                const nameMatch = /name:\s*"box_([^"]+)"/.exec(frameBlock.content);
                const titleMatch = /title:\s*"([^"]*)"/.exec(frameBlock.content);
                const descMatch = /description:\s*"([^"]*)"/.exec(frameBlock.content);
                const posMatch = /position:\s*\{x:\s*([^,]+),\s*y:\s*([^}]+)\}/.exec(frameBlock.content);
                const bgMatch = /background:\s*"([^"]+)"/.exec(frameBlock.content);
                const inputCountMatch = /input_ports:\s*(\d+)/.exec(frameBlock.content);
                const outputCountMatch = /output_ports:\s*(\d+)/.exec(frameBlock.content);
                
                // Generate default values if missing
                const id = nameMatch ? nameMatch[1] : `auto_${Date.now()}_${index}`;
                const title = titleMatch ? titleMatch[1] : `Box ${index+1}`;
                const description = descMatch ? descMatch[1] : "";
                
                // Position
                let x = 100 + (index * 50);
                let y = 100 + (index * 50);
                if (posMatch) {
                    x = parseFloat(posMatch[1]);
                    y = parseFloat(posMatch[2]);
                }
                
                // Background
                const backgroundColor = bgMatch ? bgMatch[1] : null; // Let the boxManager assign a random color
                
                // Ports
                const inputPortCount = inputCountMatch ? parseInt(inputCountMatch[1]) : 1; 
                const outputPortCount = outputCountMatch ? parseInt(outputCountMatch[1]) : 1;
                
                // Check for port names - try multiple format patterns
                let inputNames = [];
                let outputNames = [];
                
                // Format 1: input_names: ["name1", "name2"]
                const inputNamesMatch1 = /input_names:\s*\[((?:"[^"]*"(?:,\s*)?)*)\]/.exec(frameBlock.content);
                if (inputNamesMatch1) {
                    inputNames = inputNamesMatch1[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found input names format 1:", inputNames);
                }
                
                // Format 1B: Multi-line input_names array
                if (inputNames.length === 0) {
                    const inputNamesBlockMatch = /input_names:\s*\[([\s\S]*?)\]/g.exec(frameBlock.content);
                    if (inputNamesBlockMatch) {
                        const namesBlock = inputNamesBlockMatch[1];
                        console.log("Found multi-line input names block:", namesBlock);
                        const nameMatches = namesBlock.match(/"([^"]*)"/g);
                        if (nameMatches) {
                            inputNames = nameMatches.map(s => s.slice(1, -1));
                            console.log("Parsed multi-line input names:", inputNames);
                        }
                    }
                }
                
                // Format 2: input_names: { "name1", "name2" }
                const inputNamesMatch2 = /input_names:\s*\{([^}]+)\}/.exec(frameBlock.content);
                if (inputNamesMatch2 && inputNames.length === 0) {
                    inputNames = inputNamesMatch2[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found input names format 2:", inputNames);
                }
                
                // Format 3: input_labels: ["name1", "name2"]
                const inputNamesMatch3 = /input_labels:\s*\[((?:"[^"]*"(?:,\s*)?)*)\]/.exec(frameBlock.content);
                if (inputNamesMatch3 && inputNames.length === 0) {
                    inputNames = inputNamesMatch3[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found input names format 3:", inputNames);
                }
                
                // Format 4: input_labels: { "name1", "name2" }
                const inputNamesMatch4 = /input_labels:\s*\{([^}]+)\}/.exec(frameBlock.content);
                if (inputNamesMatch4 && inputNames.length === 0) {
                    inputNames = inputNamesMatch4[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found input names format 4:", inputNames);
                }
                
                // Similar for output names
                // Format 1: output_names: ["name1", "name2"]
                const outputNamesMatch1 = /output_names:\s*\[((?:"[^"]*"(?:,\s*)?)*)\]/.exec(frameBlock.content);
                if (outputNamesMatch1) {
                    outputNames = outputNamesMatch1[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found output names format 1:", outputNames);
                }
                
                // Format 1B: Multi-line output_names array
                if (outputNames.length === 0) {
                    const outputNamesBlockMatch = /output_names:\s*\[([\s\S]*?)\]/g.exec(frameBlock.content);
                    if (outputNamesBlockMatch) {
                        const namesBlock = outputNamesBlockMatch[1];
                        console.log("Found multi-line output names block:", namesBlock);
                        const nameMatches = namesBlock.match(/"([^"]*)"/g);
                        if (nameMatches) {
                            outputNames = nameMatches.map(s => s.slice(1, -1));
                            console.log("Parsed multi-line output names:", outputNames);
                        }
                    }
                }
                
                // Format 2: output_names: { "name1", "name2" }
                const outputNamesMatch2 = /output_names:\s*\{([^}]+)\}/.exec(frameBlock.content);
                if (outputNamesMatch2 && outputNames.length === 0) {
                    outputNames = outputNamesMatch2[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found output names format 2:", outputNames);
                }
                
                // Format 3: output_labels: ["name1", "name2"]
                const outputNamesMatch3 = /output_labels:\s*\[((?:"[^"]*"(?:,\s*)?)*)\]/.exec(frameBlock.content);
                if (outputNamesMatch3 && outputNames.length === 0) {
                    outputNames = outputNamesMatch3[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found output names format 3:", outputNames);
                }
                
                // Format 4: output_labels: { "name1", "name2" }
                const outputNamesMatch4 = /output_labels:\s*\{([^}]+)\}/.exec(frameBlock.content);
                if (outputNamesMatch4 && outputNames.length === 0) {
                    outputNames = outputNamesMatch4[1].match(/"([^"]*)"/g)?.map(s => s.slice(1, -1)) || [];
                    console.log("Found output names format 4:", outputNames);
                }
                
                // Try to extract port names directly from the content using pattern matching
                if (inputNames.length === 0 && inputPortCount > 0) {
                    console.log("Trying to find input port names directly in the content");
                    
                    // Daha esnek bir regex ile port isimlerini arayalım
                    // "input 1: "label"" veya "input1: "label"" formatlarını yakalar
                    const matches = [];
                    const lines = frameBlock.content.split('\n');
                    
                    for (const line of lines) {
                        // "input" ve sayı içeren satırları yakala
                        const inputLineMatch = line.match(/input\s*(\d+)\s*:\s*"([^"]*)"/i);
                        if (inputLineMatch) {
                            const portIndex = parseInt(inputLineMatch[1]) - 1; // 0-indexed
                            const portName = inputLineMatch[2];
                            matches[portIndex] = portName;
                            console.log(`Found input port ${portIndex+1} name: "${portName}"`);
                        }
                    }
                    
                    // Boşlukları doldur
                    for (let i = 0; i < inputPortCount; i++) {
                        if (!matches[i]) {
                            matches[i] = `Input ${i+1}`;
                        }
                    }
                    
                    if (matches.length > 0) {
                        inputNames = matches;
                        console.log("Final input names:", inputNames);
                    }
                }
                
                if (outputNames.length === 0 && outputPortCount > 0) {
                    console.log("Trying to find output port names directly in the content");
                    
                    // Daha esnek bir regex ile port isimlerini arayalım
                    // "output 1: "label"" veya "output1: "label"" formatlarını yakalar
                    const matches = [];
                    const lines = frameBlock.content.split('\n');
                    
                    for (const line of lines) {
                        // "output" ve sayı içeren satırları yakala
                        const outputLineMatch = line.match(/output\s*(\d+)\s*:\s*"([^"]*)"/i);
                        if (outputLineMatch) {
                            const portIndex = parseInt(outputLineMatch[1]) - 1; // 0-indexed
                            const portName = outputLineMatch[2];
                            matches[portIndex] = portName;
                            console.log(`Found output port ${portIndex+1} name: "${portName}"`);
                        }
                    }
                    
                    // Boşlukları doldur
                    for (let i = 0; i < outputPortCount; i++) {
                        if (!matches[i]) {
                            matches[i] = `Output ${i+1}`;
                        }
                    }
                    
                    if (matches.length > 0) {
                        outputNames = matches;
                        console.log("Final output names:", outputNames);
                    }
                }
                
                // Show the raw content for debugging if we still don't have port names
                if ((inputPortCount > 0 && inputNames.length === 0) || 
                    (outputPortCount > 0 && outputNames.length === 0)) {
                    console.log("Raw frame content for port name debugging:");
                    console.log(frameBlock.content);
                }
                
                console.log(`Creating box: id=${id}, title=${title}, inputs=${inputPortCount}(names=${inputNames.length}), outputs=${outputPortCount}(names=${outputNames.length}), position=[${x},${y}]`);
                
                // Create the box
                const boxElement = this.boxManager.createBox({
                    title,
                    description,
                    inputCount: inputPortCount,
                    outputCount: outputPortCount,
                    inputNames,
                    outputNames,
                    x,
                    y,
                    backgroundColor
                });
                
                // Store created box with its id for wire connections
                boxElement.id = id;
                boxes[id] = boxElement;
            });
            
            // Process wire blocks
            const wireBlocks = blocks.filter(block => block.type === "CONTROL");
            
            console.log(`Found ${wireBlocks.length} wire blocks`);
            
            wireBlocks.forEach((wireBlock, index) => {
                console.log(`Processing wire ${index+1}:`, wireBlock.content);
                
                // Extract source and target with more flexible regex
                const sourceMatch = /source:\s*\{box:\s*"box_([^"]+)",\s*port:\s*(\d+)\}/.exec(wireBlock.content);
                const targetMatch = /target:\s*\{box:\s*"box_([^"]+)",\s*port:\s*(\d+)\}/.exec(wireBlock.content);
                
                if (sourceMatch && targetMatch) {
                    const sourceId = sourceMatch[1];
                    const sourcePortIndex = parseInt(sourceMatch[2]);
                    const targetId = targetMatch[1];
                    const targetPortIndex = parseInt(targetMatch[2]);
                    
                    console.log(`Wire connection: source=${sourceId}:${sourcePortIndex}, target=${targetId}:${targetPortIndex}`);
                    
                    if (boxes[sourceId] && boxes[targetId]) {
                        const sourceBox = boxes[sourceId];
                        const targetBox = boxes[targetId];
                        
                        // Get the port elements
                        const sourcePort = sourceBox.querySelector(`.port[data-type="output"][data-index="${sourcePortIndex}"]`);
                        const targetPort = targetBox.querySelector(`.port[data-type="input"][data-index="${targetPortIndex}"]`);
                        
                        if (sourcePort && targetPort) {
                            // Create the wire connection
                            console.log("Creating wire connection");
                            this.wireManager.createWire(sourcePort, targetPort);
                        } else {
                            console.error(`Ports not found: source=${!!sourcePort}, target=${!!targetPort}`);
                        }
                    } else {
                        console.error(`Boxes not found: source=${!!boxes[sourceId]}, target=${!!boxes[targetId]}`);
                    }
                } else {
                    console.error("Failed to parse wire properties:", wireBlock.content);
                }
            });
            
            // Update the canvas
            this.canvasManager.updateTransform();
            this.wireManager.updateWires();
            
            console.log("Schema loading complete");
            
            if (frameBlocks.length === 0) {
                console.error("No valid frames found in the file");
                alert("Şema dosyasında hiçbir kutu bulunamadı. Dosya formatı doğru olmayabilir.");
            }
        } catch (error) {
            console.error("Error parsing SheLang code:", error);
            alert("Şema yüklenirken bir hata oluştu: " + error.message);
        }
    }
} 