# SHEGEN - Visual Schema Generator

SHEGEN is a visual schema generator that allows you to create, edit, and manage complex schemas through an intuitive graphical interface.

## Keyboard Shortcuts

### Canvas Navigation
- `Ctrl + Mouse Wheel`: Zoom in/out
- `Space + Mouse Drag`: Pan canvas
- `Ctrl + 0`: Reset zoom to 100%
- `Ctrl + F`: Fit all elements to screen

### Box Operations
- `Delete` or `Backspace`: Delete selected box
- `Ctrl + D`: Duplicate selected box
- `Ctrl + Left Click`: Select multiple boxes
- `Esc`: Deselect all boxes
- `Arrow Keys`: Move selected box(es) by 1 pixel
- `Shift + Arrow Keys`: Move selected box(es) by 10 pixels

### Wire Operations
- `Left Click` on wire: Select wire
- `Delete` or `Backspace`: Delete selected wire
- `M`: Toggle magnet mode (snap to ports)
- `Alt + Click` on wire: Add/remove wire point

### File Operations
- `Ctrl + S`: Save schema
- `Ctrl + O`: Open schema
- `Ctrl + N`: New schema

### View Operations
- `Ctrl + +`: Zoom in
- `Ctrl + -`: Zoom out


### Box Editing
- `Double Click` on box: Edit box properties
- `Shift + F2`: Rename selected box
- `Ctrl + Up/Down`: Change box layer
- `Alt + C`: Change box color

### Multi-Selection Operations
- `Ctrl + A`: Select all boxes
- `Ctrl + Mouse Drag`: Create selection rectangle
- `Shift + Click`: Add/remove box from selection


### Port Operations
- `Right Click` on port: Edit port name
- `Shift + Right Click` on port: Toggle port type
- `Alt + Right Click` on port: Add new port
- `Alt + Left Click` on port: remove port

### Undo/Redo
- `Ctrl + Z`: Undo last action
- `Ctrl + Y` or `Ctrl + Shift + Z`: Redo last action

## Additional Features

### Magnet Mode
Toggle magnet mode using the magnet button in the toolbar or press `M` to enable/disable automatic wire snapping to ports.

### Layer Management
Use the layer panel (toggle with `Ctrl + L`) to:
- Reorder boxes between layers
- Show/hide specific layers
- Lock layers to prevent editing



## Features

- Drag and drop functionality for creating and positioning boxes
- Wire connections between input and output ports
- Customizable box titles, descriptions, and background colors
- Configurable number and names of input/output ports
- Save and load schematics in SHELANG format
- Modern file dialogs for intuitive file management
- Magnetic arrangement feature for easy alignment
- Zoom and pan navigation for large schematics
- Undo/redo functionality
- Keyboard shortcuts for efficient workflow

## Usage

### Basic Operations

1. **Creating a Box**:
   - Click the "Add Box" button in the left sidebar
   - Configure the box properties (title, description, input/output ports)
   - Set the number of input and output ports
   - Assign names to each port (optional)
   - Choose a background color (or use auto-assigned colors)
   - Click "Create" to add the box to the canvas

2. **Establishing Connections**:
   - Click and drag from an output port (right side of a box)
   - Release the mouse over an input port (left side of another box)
   - The connection will be visualized as a curved line
   - Click on a connection and press the "Delete" button to remove it

3. **Saving a Schematic**:
   - Click the "Save" button in the top menu
   - Select a location and filename in the save dialog
   - The schematic will be saved as a .shelang file with all box and connection details preserved

4. **Loading a Schematic**:
   - Click the "Load" button in the top menu
   - Select an existing .shelang file
   - The schematic will be automatically loaded with all details (boxes, connections, colors, port names)

5. **Editing Boxes**:
   - Click a box to select it
   - Drag to reposition
   - Press "Delete" key to remove
   - Edit ports using the context menu

6. **Using the Magnet Tool**:
   - Click the magnet icon in the toolbar
   - Boxes will automatically align to a grid for neater arrangement

### Tips & Shortcuts

- **Navigation**:
  - Use mouse wheel to zoom in/out on the canvas
  - Right-click + drag to pan across the canvas
  - Hold Shift while dragging to constrain movement horizontally/vertically

- **Selection**:
  - Click on a box to select it (highlights with a border)
  - Ctrl+Click to select multiple boxes
  - Click and drag on empty canvas to create a selection rectangle

## SHELANG Format

SHELANG is a text-based language that defines schematics in a structured format. The file consists of several block types that describe different elements of the schematic.

### Basic Components

```
FRAME * {
    name: "box_id",
    title: "Box Title",
    description: "Box description",
    position: {x: 100, y: 200},
    background: "rgb(67, 160, 71)",
    input_ports: 2,
    output_ports: 3,
    input_names: [
        "Input 1 Name",
        "Input 2 Name"
    ],
    output_names: [
        "Output 1 Name",
        "Output 2 Name",
        "Output 3 Name"
    ]
}

CONTROL * {
    name: "wire_id",
    type: "connection",
    source: {box: "box_source_id", port: 0},
    target: {box: "box_target_id", port: 1}
}
```

### Schema Structure

- **WINDOW**: Defines the main window properties
  ```
  WINDOW * {
      name: "main_win",
      type: "web browser",
      title: "SHEGEN"
  }
  ```

- **PAGE**: Defines the page layout
  ```
  PAGE * {
      name: "main_page",
      decoration: {fill-both, expand-both},
      layout: "absolute"
  }
  ```

- **CANVAS**: Defines the working area size and properties
  ```
  CANVAS * {
      name: "main_canvas",
      width: "2000px",
      height: "2000px",
      decoration: {align: center}
  }
  ```

- **FRAME**: Defines boxes/nodes (as shown above)
- **CONTROL**: Defines connections/wires (as shown above)
- **VARIABLE**: Contains metadata
  ```
  VARIABLE * {
      name: "metadata",
      type: "object",
      value: {
          "timestamp": "2023-04-25T21:50:40.220Z",
          "version": "1.0",
          "editor": "SHEGEN Canvas"
      }
  }
  ```

## Technical Implementation

SHEGEN Canvas is built with modern web technologies:

- **JavaScript**: Core application logic
- **HTML5**: Structure and canvas elements
- **CSS3**: Styling and animations
- **SVG**: Vector graphics for wires and icons
- **File System Access API**: Modern file handling (with fallbacks for older browsers)
- **Drag and Drop API**: Intuitive user interactions

The application architecture is modular with separate managers for:
- Box creation and manipulation
- Wire connections
- Canvas navigation and zooming
- SHELANG parsing and generation
- UI components and interactions

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/username/shegen-canvas.git
   ```

2. Navigate to the project directory:
   ```
   cd shegen-canvas
   ```

3. Run on a web server (e.g., Live Server, http-server, etc.)
   ```
   npx http-server
   ```
   
   Or simply open index.html in a modern browser

## Browser Support

SHEGEN Canvas supports the following modern browsers:
- Chrome (recommended)
- Firefox
- Edge
- Safari

Some advanced features like the File System Access API may not be available in all browsers, but fallback mechanisms are provided.

## Troubleshooting

- **Wire connections not appearing**: Check that ports are properly connected
- **Loading issues**: Ensure the .shelang file uses the correct format
- **Browser compatibility**: Try Chrome for the best experience and full feature support
- **Performance issues with large schematics**: Try reducing the number of boxes or connections

## License

Released under the MIT license. See the `LICENSE` file for details.

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Development

Planned features for future releases:
- Node execution simulation
- Additional node types
- Custom node templates
- Export to different formats
- Real-time collaboration 
