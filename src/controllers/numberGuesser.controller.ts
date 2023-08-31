import {HttpStatusCode,} from "axios";
import {Action} from "../framework/type";
import {getUserById, updateUser,} from "../service/users.service";
import {startNumberGuesser,gameInstance, createNumberGuesser, gamesInProgress} from "../service/numberGuesser.service";
import {Response, Request} from "express";


const checkIfPlayerExists = (userId: string) => {
    const user = getUserById(userId);
    if (!user) {
        return false;
    }
    return true;
};

const checkIfPlayerIsInGame= (userId: string) => {
    return !(getUserById(userId).isPlaying)
};

const startGame: Action = {
    method: "post",
    path: "/guess",
    action: (request: Request, response: Response) => {
        const userId = request.header("user_id");

        if (!userId) {
            return response.status(401).send({
                error: "No user Id"
            });
        }
        if (!checkIfPlayerExists(userId)) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: "User doesn't exist"
            });
        }
        if (!checkIfPlayerIsInGame(userId)) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: "User is already in a game"
            });
        }

        const user = getUserById(userId);

        if (user) {
            if (user.isPlaying) {
                return response.status(HttpStatusCode.BadRequest).send({
                    error: "You are already in a game"
                });
            }

            if (user.hasFinished) {
                return response.status(HttpStatusCode.BadRequest).send({
                    error: "You have finished your previous game"
                });
            }

            user.isPlaying = true;
            updateUser(user);
        }

        if (gameInstance.hasEnded()) {
            const newGame = createNumberGuesser();
            gamesInProgress.push(newGame);
        }

        startNumberGuesser(userId);
        return response.status(HttpStatusCode.Ok).send();
    }
};

const guessNumbers: Action = {
    method: "patch",
    path: "/guess",
    action: (request: Request, response: Response) => {
        const userId = request.header("user_id");
        const guessedNumber: string = request.body.number;

        if (!userId) {
            return response.status(401).send({
                error: "No user Id"
            });
        }

        if (!guessedNumber || guessedNumber.length !== 5 || !/^\d+$/.test(guessedNumber)) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: "Number must be a positive 5-digit integer"
            });
        }

        const parsedNumber = parseInt(guessedNumber, 10);
        if (parsedNumber <= 0) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: "Number must be positive"
            });
        }

        const user = getUserById(userId || "");

        if (!user || !user.isPlaying) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: "You are not in a game"
            });
        }

        const game = gamesInProgress.find((g) => g.id === user.gameId)

        if(!game){
            return  response.status(HttpStatusCode.BadRequest).send({
                error:"Invalid game instance",
            })
        }

        if (user.hasFinished) {
            return response.status(HttpStatusCode.BadRequest).send({
                error: "You have finished your game"
            });
        }

        if (game.numberOfGuesses > 20) {
            user.hasFinished = true;
            updateUser(user);

            return response.status(HttpStatusCode.BadRequest).send({
                error: "You have exceeded the maximum guess attempt. Max 20"
            });
        }

        const guessResult = game.guessNumber(guessedNumber);

        if (guessedNumber == game.pickedNumber){
            user.hasFinished = true;
            updateUser(user);
            return  response.status(HttpStatusCode.Accepted).send({
                message:`Congratulations you have guessed the number in ${game.numberOfGuesses} attempts`
            })
        }

        if (game.hasEnded()) {
            const index = gamesInProgress.indexOf(game);
            if (index !== -1) {
                gamesInProgress.splice(index, 1);
            }
        }

        return response.status(HttpStatusCode.Ok).send({
            message: guessResult
        });
    }
};


export default [startGame,guessNumbers]