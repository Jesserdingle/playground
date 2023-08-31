import { randomUUID } from 'crypto';


export type User = {
  id: string;
  username: string;
  hasFinished:boolean;
  isPlaying:boolean;
  gameId:string | null;

};

const userStore: Record<string, User> = {};

export const isUsernameTaken = (username: string) => {
  const users = Object.values(userStore);
  return users.some((user) => user.username === username);
}


export const createUser = (username: string) => {
  const id = randomUUID();

  if(isUsernameTaken(username)){
    throw new Error("Username is already taken");
  }


  userStore[id] = {
    id,
    username,
    gameId:null,
   isPlaying: false,
    hasFinished:false,

  };
};

export const getUsers = () => {
  return Object.values(userStore);
}
export const updateUser = (user: User) => {
  userStore[user.id] = user;
}

export const getUserById = (userId: string) => {
  return userStore[userId];
}



export const deleteUserById = (userId: string) => {
  if (userStore[userId]) {
    delete userStore[userId];
  }
}
