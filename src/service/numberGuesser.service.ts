import {randomUUID} from "crypto";
import {getUserById, updateUser,} from "./users.service";

export  class numberGuesser {
    id:string;
    numberOfGuesses: number;
    pickedNumber:string;
    ended:boolean;

    constructor() {
        this.id = randomUUID();
        this.ended = false;
        this.pickedNumber = this.generateNumber()
        this.numberOfGuesses = 0;
    }

   generateNumber = () => {
       const min = 10000;
       const max = 99999;
       const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
       return randomNumber.toString();
   }
    hasEnded() {
        return this.ended;
    }
    guessNumber = (guess: string) => {
        this.numberOfGuesses++;
        let hint = "";

        for (let i = 0; i < guess.length; i++) {
            const guessedDigit = parseInt(guess[i]);
            const pickedDigit = parseInt(this.pickedNumber[i]);

            if (guessedDigit === pickedDigit) {
                hint += "ok ";
            } else if (guessedDigit < pickedDigit) {
                hint += "higher ";
            } else if (guessedDigit > pickedDigit) {
                hint += "lower ";
            }
        }
            return `Hint: ${hint}. Number of attempts: ${this.numberOfGuesses} max 20`;

    }


}

export const gameInstance = new numberGuesser()

export const gamesInProgress: numberGuesser[] = [];

export function createNumberGuesser(): numberGuesser {
    return new numberGuesser();
}

export const startNumberGuesser = (userId:string) => {
    const game = new numberGuesser();
    gamesInProgress.push(game);
    const  user = getUserById(userId);
    if(user){
        user.isPlaying =true;
        user.gameId = game.id;
        updateUser(user)
    }
}




