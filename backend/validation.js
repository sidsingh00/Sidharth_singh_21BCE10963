// validation.js
function validateMove(move, gameState) {
    const { from, to } = move;

    // Basic validation (bounds checking)
    if (to.row < 0 || to.row >= 5 || to.col < 0 || to.col >= 5) {
        return false; // Move out of bounds
    }

    const piece = gameState.grid[from.row][from.col];
    if (!piece || piece[0] !== gameState.currentPlayer) {
        return false; // Invalid piece or not the player's turn
    }

    // Additional game rules validation can be added here
    return true; // Move is valid
}

module.exports = { validateMove };
