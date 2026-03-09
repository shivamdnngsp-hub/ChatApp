import { io } from "socket.io-client";

export const socket = io("https://chatapp-wyu8.onrender.com", {
  withCredentials: true,
});