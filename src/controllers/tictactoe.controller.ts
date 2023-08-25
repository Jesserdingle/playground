// Import necessary modules and services
import { Request, Response } from 'express';
import { Action } from '../framework/type';
import { getUserById, updateUser } from '../service/users.service';
import { getTicTacToe, getUserList, placeSign, startTicTacToe } from "../service/ticktactoe.service";
import { HttpStatusCode } from "axios";

// Function to validate if a user exists based on userId
const validateUserExists = (userId: string) => {
    const user = getUserById(userId);
    if (!user) {
        return false;
    }
    return true;
};

// Function to validate if both players are available to start a game
const validatePlayerAvailability = (userId: string, opponentId: string) => {
    return !(getUserById(userId).isPlaying || getUserById(opponentId).isPlaying);
};

// Function to validate if a move is valid
const validateMove = (userId: string, x: number, y: number) => {
    const res = placeSign(userId, x, y);
    if (res === null) {
        return false;
    }
    return true;
};

// Define the "startGame" action
const startGame: Action = {
    method: 'post',
    path: '/game',
    action: (request: Request, response: Response) => {
        const userId = request.header('user_id');
        const opponentId = request.body.opponentId;

        // Validate user and opponent information
        if (!userId) {
            return response.status(401).send({
                error: `User ID is missing`,
            });
        }

        if (!validateUserExists(userId)) {
            return response.status(401).send({
                error: `User doesn't exist`,
            });
        }

        if (!opponentId) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: `Opponent ID is missing`,
            });
        }

        if (!getUserById(opponentId)) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: `Opponent doesn't exist`,
            });
        }

        if (!validatePlayerAvailability(userId, opponentId)) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: `One of the players is in a game`,
            });
        }

        // Update player status and start a new TicTacToe game
        const user = getUserById(userId);
        if (user) {
            user.isPlaying = true;
            updateUser(user);
        }

        const opponent = getUserById(opponentId);
        if (opponent) {
            opponent.isPlaying = true;
            updateUser(opponent);
        }

        startTicTacToe(userId!, opponentId!);

        return response.status(HttpStatusCode.Ok).send();
    }
};

// Define the "makeMove" action
const makeMove: Action = {
    method: "patch",
    path: "/game",
    action: (request: Request, response: Response) => {
        const userId = request.header('user_id');
        const x = request.body.x;
        const y = request.body.y;

        // Validate user and move coordinates
        if (!userId) {
            return response.status(401).send({
                error: `User ID is missing`,
            });
        }

        if (!validateUserExists(userId)) {
            return response.status(401).send({
                error: `User doesn't exist`,
            });
        }

        if (x === undefined || y === undefined) {
            return response.status(400).send({
                error: `Move coordinates are missing`,
            });
        }

        if (!validateMove(userId, x, y)) {
            return response.status(400).send({
                error: `Invalid move`,
            });
        }

        return response.status(HttpStatusCode.Ok).send();
    }
};

// Define the "getGame" action
const getGame: Action = {
    method: "get",
    path: "/game",
    action: (request: Request, response: Response) => {
        const userId = request.header('user_id');
        if (!userId) {
            return response.status(401).send({
                error: `User ID is missing`,
            });
        }
        if (!validateUserExists(userId)) {
            return response.status(401).send({
                error: `User doesn't exist`,
            });
        }
        // Get and return the TicTacToe game state
        response.json(getTicTacToe(userId!));
    }
};

// Define the "getGameUsers" action
const getGameUsers: Action = {
    method: "get",
    path: "/users/game/:gameId",
    action: (request: Request, response: Response) => {
        const gameId = request.params.gameId;
        // Get and return the list of users in a game
        response.json(getUserList(gameId));
    }
};

// Export all defined actions as an array
export default [startGame, makeMove, getGame, getGameUsers];
