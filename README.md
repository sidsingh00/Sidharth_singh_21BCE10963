# *Multiplayer 5x5 Custom Chess Game*
Overview

This is a multiplayer, grid-based game built with Node.js, Express, and Socket.io. The game allows two players to connect and take turns moving pieces on a grid. The game logic ensures valid moves based on piece type and checks for a winner after each move.
#Key Features:

  .  Multiplayer Support: Up to two players can join a game session.
  .  Real-time Updates: The game state is synchronized between the two players using WebSockets.
  .  Custom Game Logic: Includes movement rules for different types of pieces and a winning condition.
  .  Graceful Handling of Disconnections: If a player disconnects, the game state is reset.


# System Design
1. Architecture
   The project follows a client-server architecture:
   .Client (Frontend): Built with React, it provides the user interface, handles user input, and communicates with the server to fetch updates and send player moves.
    Server (Backend): Built with Node.js and Socket.io, it manages the game state, validates moves, and broadcasts updates to all connected clients.

2. Data Flow

    1.Connection: When a player connects, the server assigns them to a team (A or B) and updates the client.
    2.Game Start: Once two players are connected, the game begins, and the server notifies both clients.
    3.Move Handling: When a player makes a move, the client sends the move data to the server. The server validates the move, updates the game state, and broadcasts the new state to   
      both players.
    4.Game End: If a winning condition is met, the server declares a winner and notifies both clients.

# Project Structure
    5x5-Custom-game/
     │
     ├── BackEnd/
     │   ├── server.js
     │   ├── gamelogic.js
     │   ├── validation.js
     │   ├── package.json
     │   └── README.md
     │
     └── FrontEnd/
          ├── App.js
          ├── App.css
          └── index.js
          └── node_modules/


# Frontend (React)
   # React Components

  .App.js: The main component that manages the state of the game, including the grid, selected pieces, current player, move history, and game status.
        .State Variables:
            .grid: Represents the current state of the game grid.
            .selected: Stores the currently selected piece by the player.
            .currentPlayer: Tracks whose turn it is.
            .moveHistory: Keeps a record of all moves made in the game.
            .winner: Stores the winner of the game, if any.
            .isGameStarted: Flags whether the game has started.

  .Event Handlers:
          .handleClick: Handles selecting a piece on the grid.
          .movePiece: Handles moving the selected piece.
          .startGame: Resets the game state and starts a new game.

  .Socket Events:
          .gameStateUpdate: Updates the grid and other game states when a player makes a move.
          .gameOver: Displays the winner when the game ends.
          .gameReset: Resets the game if a player disconnects.

# Game Logic

.The movement logic for different pieces (P, H1, H2, H3) is implemented in the handleMoveLogic function. It ensures that each piece moves according to the game rules and checks for 
 valid moves.
.The game checks for a winner after each move using the checkWinner function.

# Backend (Node.js)
  #Express Server
    .server.js: The main server file that sets up an Express server and uses Socket.io for real-time communication.

# Game State Management
  .Game State Object: Stores the grid, current player, move history, and winner.


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


# Socket.io Events
  .Connection: Assigns players to teams and starts the game when two players are connected.

              io.on('connection', (socket) => {
              // Player assignment logic
          });

  .playerMove: Handles incoming moves from players, validates the move, updates the game state, and emits updates to both players.
  .disconnect: Handles player disconnections by resetting the game state.


# Future Enhancements

   .Spectator Mode: Allow additional users to join as spectators.
   .Chat Feature: Add a real-time chat feature for players to communicate.
   .Improved UI: Enhance the user interface with animations and better styling.
   .Persistent Game State: Store game states in a database to allow games to be resumed later.

# Usage

   1) Connecting Players:
        Player A connects first and is assigned the ID 'A'.
        Player B connects next and is assigned the ID 'B'.
        The game starts once both players are connected.

   2) Making Moves:
        Players take turns moving their pieces.
        Each move is validated on the server, and the game state is updated if the move is valid.
        Invalid moves are rejected, and the player is prompted to try again.

   3)  Winning the Game:
        The game ends when a player successfully moves one of their pieces to the opponent's starting row.
        The server notifies both players of the winner.

   4)  Handling Disconnections:
        If a player disconnects, the game state resets, and the remaining player must wait for a new opponent.
# Making Moves

    Players take turns moving their pieces.
    Each move is validated on the server, and the game state is updated if the move is valid.
    Invalid moves are rejected, and the player is prompted to try again.

# Winning the Game

    The game ends when a player successfully moves one of their pieces to the opponent's starting row.
    The server notifies both players of the winner.

# Handling Disconnections

    If a player disconnects, the game state resets, and the remaining player must wait for a new opponent.
      
