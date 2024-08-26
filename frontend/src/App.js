import './App.css';
import { io } from 'socket.io-client';
import React, { useState, useEffect } from 'react';

// Initial grid setup
const initialGrid = [
  ['A-P1', 'A-H2', 'A-H1', 'A-H3', 'A-P2'],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['B-P1', 'B-H2', 'B-H1', 'B-H3', 'B-P2'],
];

const socket = io('http://localhost:3000'); // Initialize socket connection

function App() {
  const [grid, setGrid] = useState(initialGrid);
  const [selected, setSelected] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [moveHistory, setMoveHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerId, setPlayerId] = useState(null); // Manage player ID

  useEffect(() => {
    // Handle socket events
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('playerAssignment', ({ playerId }) => {
      setPlayerId(playerId);
      console.log('You are player:', playerId);
    });

    socket.on('startGame', (data) => {
      alert(data.message);
      setIsGameStarted(true);
    });

    socket.on('gameStateUpdate', (newGameState) => {
      setGrid(newGameState.grid);
      setCurrentPlayer(newGameState.currentPlayer);
      setWinner(newGameState.winner);
      setMoveHistory(newGameState.moveHistory);
    });

    socket.on('gameReset', (data) => {
      alert(data.message);
      resetGame();
    });

    socket.on('gameOver', ({ winner }) => {
      setWinner(winner);
    });

    socket.on('invalidMove', ({ message }) => {
      alert(message);
    });

    socket.on('gameFull', ({ message }) => {
      alert(message);
      socket.disconnect();
    });

    return () => {
      // Clean up socket events
      socket.off('connect');
      socket.off('playerAssignment');
      socket.off('startGame');
      socket.off('gameStateUpdate');
      socket.off('gameReset');
      socket.off('gameOver');
      socket.off('invalidMove');
      socket.off('gameFull');
    };
  }, []);

  const resetGame = () => {
    setGrid(initialGrid);
    setSelected(null);
    setCurrentPlayer('A');
    setMoveHistory([]);
    setWinner(null);
    setIsGameStarted(false);
  };

  const handleClick = (rowIndex, colIndex) => {
    if (!isGameStarted || winner) return;
    setSelected({ row: rowIndex, col: colIndex });
  };

  const isSameTeam = (piece1, piece2) => piece1[0] === piece2[0];

  const movePiece = (direction) => {
    if (!selected || !isGameStarted || winner) return;

    const { row, col } = selected;
    const piece = grid[row][col];

    if (!piece.startsWith(currentPlayer)) return;

    let newRow = row;
    let newCol = col;
    const isTeamA = currentPlayer === 'A';
    const isTeamB = currentPlayer === 'B';
    const moveMap = {
      L: { newRow, newCol: col > 0 ? col - 1 : col },
      R: { newRow, newCol: col < 4 ? col + 1 : col },
      B: { newRow: isTeamA ? row > 0 ? row - 1 : row : row < 4 ? row + 1 : row, newCol },
      F: { newRow: isTeamA ? row < 4 ? row + 1 : row : row > 0 ? row - 1 : row, newCol },
      H1_L: { newRow, newCol: col > 0 ? col - 2 : col },
      H1_R: { newRow, newCol: col < 4 ? col + 2 : col },
      H1_B: { newRow: isTeamA ? row > 0 ? row - 2 : row : row < 4 ? row + 2 : row, newCol },
      H1_F: { newRow: isTeamA ? row < 4 ? row + 2 : row : row > 0 ? row - 2 : row, newCol },
      H2_FL: { newRow: isTeamA ? row + 2 : row - 2, newCol: col - 2 },
      H2_FR: { newRow: isTeamA ? row + 2 : row - 2, newCol: col + 2 },
      H2_BL: { newRow: isTeamA ? row - 2 : row + 2, newCol: col - 2 },
      H2_BR: { newRow: isTeamA ? row - 2 : row + 2, newCol: col + 2 },
      H3_FL: { newRow: isTeamA ? row + 2 : row - 2, newCol: isTeamA ? col + 1 : col - 1 },
      H3_FR: { newRow: isTeamA ? row + 2 : row - 2, newCol: isTeamA ? col - 1 : col + 1 },
      H3_BL: { newRow: isTeamA ? row - 2 : row + 2, newCol: isTeamA ? col + 1 : col - 1 },
      H3_BR: { newRow: isTeamA ? row - 2 : row + 2, newCol: isTeamA ? col - 1 : col + 1 },
      H3_RF: { newRow: row - 1, newCol: isTeamA ? col + 2 : col - 2 },
      H3_RB: { newRow: row + 1, newCol: isTeamA ? col + 2 : col - 2 },
      H3_LF: { newRow: row - 1, newCol: isTeamA ? col - 2 : col + 2 },
      H3_LB: { newRow: row + 1, newCol: isTeamA ? col - 2 : col + 2 },
    };

    if (direction in moveMap) {
      newRow = moveMap[direction].newRow;
      newCol = moveMap[direction].newCol;
    }

    const isWithinBounds = newRow >= 0 && newRow <= 4 && newCol >= 0 && newCol <= 4;

    if (isWithinBounds) {
      const targetPiece = grid[newRow][newCol];

      if (!targetPiece || !isSameTeam(piece, targetPiece)) {
        const newGrid = [...grid];
        newGrid[newRow][newCol] = newGrid[row][col];
        newGrid[row][col] = '';

        let moveRecord = `${piece}:${direction}`;
        if (targetPiece) {
          moveRecord += ` (Captured ${targetPiece})`;
        }

        setGrid(newGrid);
        setMoveHistory(prevHistory => {
          const updatedHistory = [...prevHistory, moveRecord];
          return updatedHistory.length > 5 ? updatedHistory.slice(1) : updatedHistory;
        });

        setSelected({ row: newRow, col: newCol });
        setCurrentPlayer(currentPlayer === 'A' ? 'B' : 'A');
      }
    }
  };

  const checkWinner = () => {
    const teamA = grid.flat().filter(piece => piece.startsWith('A')).length;
    const teamB = grid.flat().filter(piece => piece.startsWith('B')).length;

    if (teamA === 0) {
      setWinner('B');
    } else if (teamB === 0) {
      setWinner('A');
    }
  };

  useEffect(() => {
    checkWinner();
  }, [grid]);

  const startGame = () => {
    setIsGameStarted(true);
    setWinner(null);
    setMoveHistory([]);
    setSelected(null);
    setGrid(initialGrid);
    setCurrentPlayer('A');
  };

  return (
    <div className="game-container">
      {!isGameStarted ? (
        <>
          <h1>Welcome</h1>
          <button onClick={startGame}>Start Game</button>
        </>
      ) : (
        <>
          <h1 className={currentPlayer === 'A' ? 'player-a' : 'player-b'}>
            Current Player: {currentPlayer}
          </h1>
          {winner && (
            <>
              <h2 className="winner-highlight">Player {winner} Wins!</h2>
              <button onClick={startGame}>Start New Game</button>
            </>
          )}
          <div className="grid">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  className={`grid-item ${selected && selected.row === rowIndex && selected.col === colIndex ? 'selected' : ''}`}
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  {cell}
                </div>
              ))
            )}
          </div>
          <div id="selectedPiece">
            Selected: {selected ? grid[selected.row][selected.col] : 'None'}
          </div>
          <div className="controls">
            {selected && grid[selected.row][selected.col].includes('H3') ? (
              <>
                <button onClick={() => movePiece('H3_FL')}>FL</button>
                <button onClick={() => movePiece('H3_FR')}>FR</button>
                <button onClick={() => movePiece('H3_BL')}>BL</button>
                <button onClick={() => movePiece('H3_BR')}>BR</button>
                <button onClick={() => movePiece('H3_RF')}>RF</button>
                <button onClick={() => movePiece('H3_RB')}>RB</button>
                <button onClick={() => movePiece('H3_LF')}>LF</button>
                <button onClick={() => movePiece('H3_LB')}>LB</button>
              </>
            ) : selected && grid[selected.row][selected.col].includes('H2') ? (
              <>
                <button onClick={() => movePiece('H2_FL')}>FL</button>
                <button onClick={() => movePiece('H2_FR')}>FR</button>
                <button onClick={() => movePiece('H2_BL')}>BL</button>
                <button onClick={() => movePiece('H2_BR')}>BR</button>
              </>
            ) : selected && grid[selected.row][selected.col].includes('H1') ? (
              <>
                <button onClick={() => movePiece('H1_L')}>L</button>
                <button onClick={() => movePiece('H1_R')}>R</button>
                <button onClick={() => movePiece('H1_F')}>F</button>
                <button onClick={() => movePiece('H1_B')}>B</button>
              </>
            ) : (
              <>
                <button onClick={() => movePiece('L')}>L</button>
                <button onClick={() => movePiece('R')}>R</button>
                <button onClick={() => movePiece('F')}>F</button>
                <button onClick={() => movePiece('B')}>B</button>
              </>
            )}
          </div>
          <div className="move-history">
            <h3>Move History:</h3>
            <ul>
              {moveHistory.map((move, index) => (
                <li key={index}>{move}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;