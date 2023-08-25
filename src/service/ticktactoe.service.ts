import { randomUUID } from "crypto";
import { getUserById, User } from "./users.service";

// Define the TicTacToe class
class TicTacToe {
    id: string;
    playerOne: string;
    playerTwo: string;
    turn: string; // Represents the current player's sign ('O' or 'X')
    board: string[][] = [["", "", ""], ["", "", ""], ["", "", ""]]; // Represents the game board
    isFinished: boolean; // Indicates if the game is finished
    winnerId: null | string; // Stores the ID of the winning player or null

    constructor(circlePlayer: string, crossPlayer: string) {
        // Randomly determine the starting player
        if (Math.round(Math.random())) {
            this.playerOne = circlePlayer;
            this.playerTwo = crossPlayer;
        } else {
            this.playerOne = crossPlayer;
            this.playerTwo = circlePlayer;
        }
        // Generate a unique game ID
        this.id = randomUUID();
        this.isFinished = false; // Initialize game state
        this.winnerId = null; // Initialize winner ID to null
        this.turn = 'O'; // Start with player one's turn

        // Initialize the board with empty cells
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.board[i][j] = "";
            }
        }
    }

    // Method to make a move on the board
    move = (userId: string, x: number, y: number) => {
        if (this.playerOne === userId && this.turn === 'O') {
            this.board[y][x] = 'O';
            this.turn = 'X';
        } else if (this.playerTwo === userId && this.turn === 'X') {
            this.board[y][x] = 'X';
            this.turn = 'O';
        }
    }
}

// Define the Game type
export type Game = {
    id: string;
    turn: string; // Represents player's sign ('O' or 'X')
    board: string[][];
    isFinished: boolean;
    winnerId: null | string;
    playerSign: string; // Represents the sign of the player
};

// Array to store ongoing games
const games: TicTacToe[] = [];

// Function to start a new TicTacToe game
export const startTicTacToe = (userId: string, opponentId: string) => {
    const game = new TicTacToe(userId, opponentId);
    games.push(game);
};

// Function to get the sign of a player in a game
const getPlayerSign = (game: TicTacToe, userId: string) => {
    if (game.playerOne === userId) {
        return 'O';
    } else if (game.playerTwo === userId) {
        return 'X';
    } else {
        return '';
    }
};

// Function to place a sign on the board
export const placeSign = (userId: string, x: number, y: number) => {
    // Find the ongoing game that the user is part of
    const game = games.find(value => !value.isFinished && (value.playerOne === userId || value.playerTwo === userId));
    if (!game) {
        return null; // Return null if no valid game found
    }
    // Check if it's the user's turn
    if ((game.playerOne === userId && game.turn === 'X') || (game.playerTwo === userId && game.turn === 'O')) {
        return null; // Return null if it's not the user's turn
    }
    // Check if the selected cell is already occupied
    if (game.board[y - 1][x - 1] !== "") {
        return null; // Return null if the cell is already occupied
    }
    // Perform the move and update game state
    game.move(userId, x - 1, y - 1);
    game.isFinished = true;

    // Check for a winner or a draw
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (game.board[i][j] === "") {
                game.isFinished = false;
            }
        }
    }

    // Determine the winning player's sign
    const winSign = getWinningUser(game);

    // Update the winner ID
    if (winSign === null) {
        game.winnerId = null;
    } else {
        if (winSign === 'X') {
            game.winnerId = game.playerTwo;
        } else {
            game.winnerId = game.playerOne;
        }
    }

    return game; // Return the updated game
};

// Function to determine the winning user's sign
const getWinningUser = (game: TicTacToe) => {
    if (game.isFinished) {
        getUserById(game.playerOne).isPlaying = false;
        getUserById(game.playerTwo).isPlaying = false;

        // Check rows and columns for a win
        for (let i = 0; i < 3; i++) {
            if (game.board[i][0] === game.board[i][1] && game.board[i][0] === game.board[i][2]) {
                return game.board[i][0];
            }
        }

        for (let i = 0; i < 3; i++) {
            if (game.board[0][i] === game.board[1][i] && game.board[0][i] === game.board[2][i]) {
                return game.board[0][i];
            }
        }

        // Check diagonals for a win
        if (game.board[0][0] === game.board[1][1] && game.board[1][1] === game.board[2][2]) {
            return game.board[0][0];
        }

        if (game.board[0][2] === game.board[1][1] && game.board[1][1] === game.board[2][0]) {
            return game.board[0][2];
        }
    }

    return null; // Return null if no winner yet
}

// Function to get the TicTacToe game state for a user
export const getTicTacToe = (userId: string) => {
    const game = games.find(value => (value.playerOne === userId || value.playerTwo === userId));

    if (!game) {
        return null; // Return null if no game found
    }

    const playerSign = getPlayerSign(game, userId);

    const returnGame: Game = {
        id: game.id,
        board: game.board,
        turn: game.turn,
        winnerId: game.winnerId,
        isFinished: game.isFinished,
        playerSign: playerSign // Add the playerSign property
    };

    return returnGame; // Return the game state
};

// Function to get the list of users in a game
export const getUserList = (gameId: string) => {
    const game = games.find(value => value.id === gameId);

    if (!game) {
        return []; // Return an empty list if game not found
    }

    const list: User[] = [];
    list.push(getUserById(game.playerOne));
    list.push(getUserById(game.playerTwo));

    return list; // Return the list of users
};
