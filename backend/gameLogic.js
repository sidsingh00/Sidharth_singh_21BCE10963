function initializeGame() {
    return {
        grid: [
            ['A-P1', 'A-H2', 'A-H1', 'A-H3', 'A-P2'],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['B-P1', 'B-H2', 'B-H1', 'B-H3', 'B-P2'],
        ],
        currentPlayer: 'A',
        moveHistory: [],
        winner: null,
    };
}

function isMoveValid(move, gameState) {
    const { from, to } = move;
    const piece = gameState.grid[from.row][from.col];
    const targetPiece = gameState.grid[to.row][to.col];
    
    if (!piece.startsWith(gameState.currentPlayer)) return false;
    
    const isWithinBounds = to.row >= 0 && to.row <= 4 && to.col >= 0 && to.col <= 4;
    if (!isWithinBounds) return false;

    if (targetPiece && targetPiece[0] === piece[0]) return false;

    return true;
}

function updateGameState(move, gameState) {
    if (!isMoveValid(move, gameState)) {
        return null; 
    }

    const { from, to } = move;
    const piece = gameState.grid[from.row][from.col];

    gameState.grid[to.row][to.col] = piece;
    gameState.grid[from.row][from.col] = '';

    gameState.moveHistory.push(`${piece} moved from ${from.row},${from.col} to ${to.row},${to.col}`);

    gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';

    const winner = checkGameOver(gameState);
    if (winner) {
        gameState.winner = winner;
    }

    return gameState;
}

function checkGameOver(gameState) {
    const teamA = gameState.grid.flat().filter(piece => piece.startsWith('A')).length;
    const teamB = gameState.grid.flat().filter(piece => piece.startsWith('B')).length;

    if (teamA === 0) return 'B';
    if (teamB === 0) return 'A';
    return null;
}

function makeMove(fromRow, fromCol, toRow, toCol, gameState) {
    const move = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol }
    };
    return updateGameState(move, gameState);
}

module.exports = { initializeGame, updateGameState, checkGameOver, makeMove };
