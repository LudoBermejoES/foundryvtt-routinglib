/**
 * Centralized Coordinate Helper for FoundryVTT v13
 * 
 * This module provides a unified coordinate transformation system that can be used
 * by both routinglib and routing-token modules to ensure consistency.
 * 
 * All coordinate calculations are centralized here to avoid duplication and ensure
 * that both modules use exactly the same mathematical transformations.
 */

export class CoordinateHelper {
    constructor() {
        this.debugEnabled = false;
    }

    /**
     * Enable or disable debug logging for coordinate operations
     */
    setDebugEnabled(enabled) {
        this.debugEnabled = enabled;
    }

    /**
     * Log debug information if debug is enabled
     */
    debugLog(...args) {
        if (this.debugEnabled) {
            console.log('[CoordinateHelper]', ...args);
        }
    }

    /**
     * Convert pixel coordinates to grid coordinates
     * Uses center-based conversion aligned with FoundryVTT's coordinate system
     * 
     * @param {number} pixelX - X coordinate in pixels
     * @param {number} pixelY - Y coordinate in pixels
     * @param {Object} tokenData - Optional token data for size-aware calculations {width, height}
     * @returns {Object} Grid coordinates {x, y}
     */
    pixelToGrid(pixelX, pixelY, tokenData = null) {
        if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            return { x: pixelX, y: pixelY };
        }
        
        // Auto-detect token if not provided
        if (!tokenData) {
            tokenData = this.getSelectedTokenData();
        }
        
        // For token-aware calculations, use the token's effective size
        if (tokenData && (tokenData.width !== 1 || tokenData.height !== 1)) {
            return this.pixelToGridTokenAware(pixelX, pixelY, tokenData);
        }
        
        // Standard 1x1 token conversion
        // Use center-based conversion to align with FoundryVTT's coordinate system
        // Account for the fact that grid coordinates represent cell centers, not top-left corners
        const gridX = Math.round((pixelX - canvas.grid.size / 2) / canvas.grid.size);
        const gridY = Math.round((pixelY - canvas.grid.size / 2) / canvas.grid.size);
        
        this.debugLog(`Pixel (${pixelX}, ${pixelY}) → Grid (${gridX}, ${gridY})`);
        return { x: gridX, y: gridY };
    }

    /**
     * Token-aware pixel to grid conversion for larger tokens
     * Accounts for token size when determining grid position
     * 
     * @param {number} pixelX - X coordinate in pixels
     * @param {number} pixelY - Y coordinate in pixels 
     * @param {Object} tokenData - Token data {width, height}
     * @returns {Object} Grid coordinates {x, y}
     */
    pixelToGridTokenAware(pixelX, pixelY, tokenData) {
        // For larger tokens, the pixel coordinates represent the token's top-left corner
        // We need to calculate which grid cell the token's center occupies
        
        const tokenWidthPixels = tokenData.width * canvas.grid.size;
        const tokenHeightPixels = tokenData.height * canvas.grid.size;
        
        // Calculate the center of the token
        const tokenCenterX = pixelX + tokenWidthPixels / 2;
        const tokenCenterY = pixelY + tokenHeightPixels / 2;
        
        // Convert the token center to grid coordinates
        const gridX = Math.round((tokenCenterX - canvas.grid.size / 2) / canvas.grid.size);
        const gridY = Math.round((tokenCenterY - canvas.grid.size / 2) / canvas.grid.size);
        
        this.debugLog(`Token-aware: Pixel (${pixelX}, ${pixelY}) ${tokenData.width}x${tokenData.height} → Center (${tokenCenterX}, ${tokenCenterY}) → Grid (${gridX}, ${gridY})`);
        return { x: gridX, y: gridY };
    }

    /**
     * Convert pixel coordinates to grid coordinates (object input)
     * 
     * @param {Object} pixelPos - Pixel position {x, y}
     * @param {Object} tokenData - Optional token data for size-aware calculations
     * @returns {Object} Grid coordinates {x, y}
     */
    pixelPosToGrid(pixelPos, tokenData = null) {
        return this.pixelToGrid(pixelPos.x, pixelPos.y, tokenData);
    }

    /**
     * Convert grid coordinates to pixel coordinates (cell centers)
     * 
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {Object} tokenData - Optional token data for size-aware calculations
     * @returns {Object} Pixel coordinates {x, y}
     */
    gridToPixel(gridX, gridY, tokenData = null) {
        if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            return { x: gridX, y: gridY };
        }
        
        // Auto-detect token if not provided
        if (!tokenData) {
            tokenData = this.getSelectedTokenData();
        }
        
        // For token-aware calculations, adjust for token size
        if (tokenData && (tokenData.width !== 1 || tokenData.height !== 1)) {
            return this.gridToPixelTokenAware(gridX, gridY, tokenData);
        }
        
        // Standard 1x1 token conversion - calculate center pixel coordinates
        const pixelX = gridX * canvas.grid.size;
        const pixelY = gridY * canvas.grid.size;
        
        this.debugLog(`Grid (${gridX}, ${gridY}) → Pixel (${pixelX}, ${pixelY})`);
        return { x: pixelX, y: pixelY };
    }

    /**
     * Token-aware grid to pixel conversion for larger tokens
     * Returns the top-left corner position where the token should be placed
     * 
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {Object} tokenData - Token data {width, height}
     * @returns {Object} Pixel coordinates {x, y}
     */
    gridToPixelTokenAware(gridX, gridY, tokenData) {
        // For larger tokens, we need to calculate where to place the token's top-left corner
        // such that the token's center aligns with the grid cell center
        
        const gridCenterX = gridX * canvas.grid.size + canvas.grid.size / 2;
        const gridCenterY = gridY * canvas.grid.size + canvas.grid.size / 2;
        
        const tokenWidthPixels = tokenData.width * canvas.grid.size;
        const tokenHeightPixels = tokenData.height * canvas.grid.size;
        
        // Calculate top-left corner position to center the token on the grid cell
        const pixelX = gridCenterX - tokenWidthPixels / 2;
        const pixelY = gridCenterY - tokenHeightPixels / 2;
        
        this.debugLog(`Token-aware: Grid (${gridX}, ${gridY}) ${tokenData.width}x${tokenData.height} → Center (${gridCenterX}, ${gridCenterY}) → Top-left (${pixelX}, ${pixelY})`);
        return { x: pixelX, y: pixelY };
    }

    /**
     * Convert grid coordinates to pixel coordinates (object input)
     * 
     * @param {Object} gridPos - Grid position {x, y}
     * @param {Object} tokenData - Optional token data for size-aware calculations
     * @returns {Object} Pixel coordinates {x, y}
     */
    gridPosToPixel(gridPos, tokenData = null) {
        return this.gridToPixel(gridPos.x, gridPos.y, tokenData);
    }

    /**
     * Convert pixel coordinates to grid coordinates with bounds checking
     * Ensures grid coordinates are never negative
     * 
     * @param {Object} pixelPos - Pixel position {x, y}
     * @param {Object} tokenData - Optional token data for size-aware calculations
     * @returns {Object} Grid coordinates {x, y} with bounds checking
     */
    pixelToGridBounded(pixelPos, tokenData = null) {
        const grid = this.pixelPosToGrid(pixelPos, tokenData);
        return {
            x: Math.max(0, grid.x),
            y: Math.max(0, grid.y)
        };
    }

    /**
     * Extract token data from a token object
     * 
     * @param {Object} token - Token object
     * @returns {Object} Token data {width, height}
     */
    getTokenData(token) {
        if (!token) return { width: 1, height: 1 };
        
        // Handle both token and token document
        const doc = token.document || token;
        return {
            width: doc.width || 1,
            height: doc.height || 1
        };
    }

    /**
     * Get token data from currently selected token(s)
     * Returns the first controlled token's data, or default 1x1 if none selected
     * 
     * @returns {Object} Token data {width, height}
     */
    getSelectedTokenData() {
        try {
            // Get controlled tokens
            const controlledTokens = canvas?.tokens?.controlled;
            if (controlledTokens && controlledTokens.length > 0) {
                const token = controlledTokens[0]; // Use first selected token
                return this.getTokenData(token);
            }
            
            // Fallback: check if there's a single selected token
            const selectedToken = canvas?.tokens?.placeables?.find(token => token.controlled);
            if (selectedToken) {
                return this.getTokenData(selectedToken);
            }
            
            // Default to 1x1 token if no selection
            return { width: 1, height: 1 };
        } catch (error) {
            // Fallback in case of any errors
            this.debugLog('Error getting selected token data:', error);
            return { width: 1, height: 1 };
        }
    }

    /**
     * Convert pixel to grid using token object (convenience method)
     * 
     * @param {Object} pixelPos - Pixel position {x, y}
     * @param {Object} token - Token object (optional)
     * @returns {Object} Grid coordinates {x, y}
     */
    pixelToGridForToken(pixelPos, token = null) {
        const tokenData = token ? this.getTokenData(token) : null;
        return this.pixelPosToGrid(pixelPos, tokenData);
    }

    /**
     * Convert grid to pixel using token object (convenience method)
     * 
     * @param {Object} gridPos - Grid position {x, y}
     * @param {Object} token - Token object (optional)
     * @returns {Object} Pixel coordinates {x, y}
     */
    gridToPixelForToken(gridPos, token = null) {
        const tokenData = token ? this.getTokenData(token) : null;
        return this.gridPosToPixel(gridPos, tokenData);
    }

    /**
     * Validate that coordinates are finite numbers
     * 
     * @param {Object} coords - Coordinates {x, y}
     * @returns {boolean} True if coordinates are valid
     */
    isValidCoordinate(coords) {
        return Number.isFinite(coords.x) && Number.isFinite(coords.y);
    }

    /**
     * Ensure coordinate object has valid x,y properties
     * 
     * @param {Object} coords - Coordinates to normalize
     * @returns {Object} Normalized coordinates {x, y}
     */
    normalizeCoordinate(coords) {
        return {
            x: coords.x || 0,
            y: coords.y || 0
        };
    }

    /**
     * Convert waypoint coordinates to canvas coordinates for display
     * Handles various input formats and ensures valid output
     * 
     * @param {Object} waypoint - Waypoint coordinates
     * @returns {Object} Canvas coordinates {x, y}
     */
    waypointToCanvas(waypoint) {
        if (waypoint.x !== undefined && waypoint.y !== undefined) {
            return { x: waypoint.x, y: waypoint.y };
        }
        return { x: waypoint.x || 0, y: waypoint.y || 0 };
    }

    /**
     * Convert token position to canvas coordinates
     * Ensures compatibility with FoundryVTT v13
     * 
     * @param {Object} tokenPos - Token position
     * @returns {Object} Canvas coordinates {x, y}
     */
    tokenToCanvasPosition(tokenPos) {
        // In v13, token positions are already in canvas coordinates
        // Just ensure we have valid coordinates
        return this.normalizeCoordinate(tokenPos);
    }

    /**
     * Calculate distance between two points
     * 
     * @param {Object} point1 - First point {x, y}
     * @param {Object} point2 - Second point {x, y}
     * @returns {number} Distance between points
     */
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate grid distance between two grid positions
     * 
     * @param {Object} grid1 - First grid position {x, y}
     * @param {Object} grid2 - Second grid position {x, y}
     * @returns {number} Grid distance (Manhattan distance)
     */
    calculateGridDistance(grid1, grid2) {
        return Math.abs(grid2.x - grid1.x) + Math.abs(grid2.y - grid1.y);
    }

    /**
     * Check if a position is within canvas bounds
     * 
     * @param {Object} pixelPos - Pixel position {x, y}
     * @returns {boolean} True if position is within bounds
     */
    isWithinCanvasBounds(pixelPos) {
        return pixelPos.x >= 0 && pixelPos.y >= 0 && 
               pixelPos.x <= canvas.dimensions.width && 
               pixelPos.y <= canvas.dimensions.height;
    }

    /**
     * Convert an array of grid positions to pixel positions
     * 
     * @param {Array} gridPath - Array of grid positions
     * @returns {Array} Array of pixel positions
     */
    gridPathToPixelPath(gridPath) {
        return gridPath.map(gridPos => this.gridPosToPixel(gridPos));
    }

    /**
     * Convert an array of pixel positions to grid positions
     * 
     * @param {Array} pixelPath - Array of pixel positions
     * @returns {Array} Array of grid positions
     */
    pixelPathToGridPath(pixelPath) {
        return pixelPath.map(pixelPos => this.pixelPosToGrid(pixelPos));
    }

    /**
     * Round trip test for coordinate conversion accuracy
     * Useful for debugging coordinate consistency
     * 
     * @param {Object} originalPos - Original position {x, y}
     * @param {string} type - 'pixel' or 'grid'
     * @returns {Object} Test results with delta information
     */
    testRoundTripConversion(originalPos, type = 'pixel') {
        if (type === 'pixel') {
            const gridPos = this.pixelPosToGrid(originalPos);
            const backToPixel = this.gridPosToPixel(gridPos);
            const delta = {
                x: originalPos.x - backToPixel.x,
                y: originalPos.y - backToPixel.y
            };
            return {
                original: originalPos,
                intermediate: gridPos,
                final: backToPixel,
                delta: delta,
                accuracy: Math.abs(delta.x) + Math.abs(delta.y)
            };
        } else {
            const pixelPos = this.gridPosToPixel(originalPos);
            const backToGrid = this.pixelPosToGrid(pixelPos);
            const delta = {
                x: originalPos.x - backToGrid.x,
                y: originalPos.y - backToGrid.y
            };
            return {
                original: originalPos,
                intermediate: pixelPos,
                final: backToGrid,
                delta: delta,
                accuracy: Math.abs(delta.x) + Math.abs(delta.y)
            };
        }
    }

    /**
     * Get grid information for the current canvas
     * 
     * @returns {Object} Grid information
     */
    getGridInfo() {
        return {
            type: canvas.grid.type,
            size: canvas.grid.size,
            sizeX: canvas.grid.sizeX,
            sizeY: canvas.grid.sizeY,
            isGridless: canvas.grid.type === CONST.GRID_TYPES.GRIDLESS,
            isSquare: canvas.grid.type === CONST.GRID_TYPES.SQUARE,
            isHexagonal: canvas.grid.isHexagonal,
            dimensions: {
                width: canvas.dimensions.width,
                height: canvas.dimensions.height
            }
        };
    }

    /**
     * Debug function to analyze coordinate conversion consistency
     * 
     * @param {Array} testPositions - Array of positions to test
     */
    debugCoordinateConsistency(testPositions = [
        { x: 50, y: 50 },
        { x: 150, y: 150 },
        { x: 250, y: 250 }
    ]) {
        console.log('=== COORDINATE CONSISTENCY DEBUG ===');
        console.log('Grid Info:', this.getGridInfo());
        
        testPositions.forEach((pos, index) => {
            const result = this.testRoundTripConversion(pos, 'pixel');
            console.log(`Test ${index + 1}: Pixel (${pos.x}, ${pos.y})`);
            console.log(`  → Grid (${result.intermediate.x}, ${result.intermediate.y})`);
            console.log(`  → Pixel (${result.final.x}, ${result.final.y})`);
            console.log(`  Delta: (${result.delta.x}, ${result.delta.y}), Accuracy: ${result.accuracy}`);
        });
    }
}

// Create and export singleton instance
export const coordinateHelper = new CoordinateHelper();

// Export individual functions for backward compatibility
export const pixelToGrid = (x, y, tokenData = null) => coordinateHelper.pixelToGrid(x, y, tokenData);
export const gridToPixel = (x, y, tokenData = null) => coordinateHelper.gridToPixel(x, y, tokenData);
export const pixelPosToGrid = (pos, tokenData = null) => coordinateHelper.pixelPosToGrid(pos, tokenData);
export const gridPosToPixel = (pos, tokenData = null) => coordinateHelper.gridPosToPixel(pos, tokenData);

// Export token-aware convenience functions
export const pixelToGridTokenAware = (x, y, tokenData) => coordinateHelper.pixelToGridTokenAware(x, y, tokenData);
export const gridToPixelTokenAware = (x, y, tokenData) => coordinateHelper.gridToPixelTokenAware(x, y, tokenData);
export const getTokenData = (token) => coordinateHelper.getTokenData(token);
export const getSelectedTokenData = () => coordinateHelper.getSelectedTokenData();
export const pixelToGridForToken = (pixelPos, token = null) => coordinateHelper.pixelToGridForToken(pixelPos, token);
export const gridToPixelForToken = (gridPos, token = null) => coordinateHelper.gridToPixelForToken(gridPos, token);