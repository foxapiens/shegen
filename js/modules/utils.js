/**
 * Utility functions
 */

/**
 * Generate a random hex color code
 * @returns {string} Random color code
 */
export function getRandomColor() {
    const colors = [
        '#4285F4', // Blue
        '#DB4437', // Red
        '#F4B400', // Yellow
        '#0F9D58', // Green
        '#8833FF', // Purple
        '#FF5722', // Deep Orange
        '#00ACC1', // Cyan
        '#43A047', // Light Green
        '#E91E63', // Pink
        '#3949AB'  // Indigo
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Check if a box collides with any other boxes
 * @param {HTMLElement} box The box to check
 * @param {number} x X position to check
 * @param {number} y Y position to check
 * @param {number} scale Current canvas scale
 * @returns {boolean} True if there is a collision
 */
export function checkCollision(box, x, y, scale) {
    const boxes = document.querySelectorAll('.box');
    const boxWidth = 200;
    const boxHeight = box.offsetHeight || 100;

    // Temporary set the box position for collision detection
    const originalLeft = box.style.left;
    const originalTop = box.style.top;
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    
    // Get the box rect
    const rect1 = {
        x: x,
        y: y,
        width: boxWidth,
        height: boxHeight
    };

    let hasCollision = false;

    boxes.forEach(otherBox => {
        if (otherBox !== box) {
            const baseLeft = parseFloat(otherBox.dataset.baseLeft);
            const baseTop = parseFloat(otherBox.dataset.baseTop);
            
            const rect2 = {
                x: baseLeft,
                y: baseTop,
                width: boxWidth,
                height: otherBox.offsetHeight || 100
            };

            // Check for collision
            if (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            ) {
                hasCollision = true;
            }
        }
    });

    // Restore original position
    box.style.left = originalLeft;
    box.style.top = originalTop;

    return hasCollision;
}