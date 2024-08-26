const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = []; 
let gameState = {
    grid: [
        ['A-P1', 'A-H2', 'A-H1', 'A-H3', 'A-P2'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['B-P1', 'B-H2', 'B-H1', 'B-H3', 'B-P2'],
    ],
    currentPlayer: 'A',
    moveHistory: [],
    winner: null
};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    if (players.length < 2) {
        players.push(socket.id);
        socket.emit('playerAssignment', { playerId: players.length === 1 ? 'A' : 'B' });

        if (players.length === 2) {
            io.emit('startGame', { message: 'Game is starting!' });
        }
    } else {
        socket.emit('gameFull', { message: 'The game is already full.' });
        socket.disconnect();
    }

    socket.on('playerMove', ({ from, to, piece }) => {
        if (socket.id !== players[gameState.currentPlayer === 'A' ? 0 : 1]) return;

      
        const moveResult = handleMoveLogic(from, to, piece, gameState.grid);

        if (moveResult) {
            gameState.grid = moveResult.newGrid;
            gameState.moveHistory.push(moveResult.moveRecord);

            if (moveResult.winner) {
                gameState.winner = moveResult.winner;
                io.emit('gameOver', { winner: gameState.winner });
            } else {
                gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
                io.emit('gameStateUpdate', gameState);
            }
        } else {
            socket.emit('invalidMove', { message: 'Invalid move.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        players = players.filter(playerId => playerId !== socket.id);

        if (players.length < 2) {
            gameState = {
                grid: [
                    ['A-P1', 'A-H2', 'A-H1', 'A-H3', 'A-P2'],
                    ['', '', '', '', ''],
                    ['', '', '', '', ''],
                    ['', '', '', '', ''],
                    ['B-P1', 'B-H2', 'B-H1', 'B-H3', 'B-P2'],
                ],
                currentPlayer: 'A',
                moveHistory: [],
                winner: null
            };
            io.emit('gameReset', { message: 'A player disconnected. The game has been reset.' });
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

function handleMoveLogic(from, to, piece, grid) {
   
    let newGrid = grid.map(row => row.slice());

    
    if (to.row < 0 || to.row >= newGrid.length || to.col < 0 || to.col >= newGrid[0].length) {
        return null; 
    }

    
    if (newGrid[to.row][to.col] && newGrid[to.row][to.col][0] === piece[0]) {
        return null; 
    }

   
    let isValidMove = false;

    if (piece.includes('H1')) {
              if (from.row === to.row || from.col === to.col) {
            isValidMove = true;
        }
    } else if (piece.includes('H2')) {
       
        if (Math.abs(from.row - to.row) === Math.abs(from.col - to.col)) {
            isValidMove = true;
        }
    } else if (piece.includes('H3')) {
        
        if (from.row === to.row || from.col === to.col || Math.abs(from.row - to.row) === Math.abs(from.col - to.col)) {
            isValidMove = true;
        }
    } else if (piece.includes('P')) {
       
        let direction = piece[0] === 'A' ? 1 : -1; 
        if (to.row === from.row + direction && to.col === from.col) {
            isValidMove = true;
        }
    }

    if (!isValidMove) {
        return null; 
    }

    newGrid[to.row][to.col] = piece;
    newGrid[from.row][from.col] = '';

    let moveRecord = `${piece}: (${from.row},${from.col}) to (${to.row},${to.col})`;

    let winner = checkWinner(newGrid);

    return { newGrid, moveRecord, winner };
}

function checkWinner(grid) {
    if (grid[0].some(cell => cell && cell[0] === 'B')) {
        return 'B'; 
    }
    if (grid[4].some(cell => cell && cell[0] === 'A')) {
        return 'A';
    }

    return null;
}
