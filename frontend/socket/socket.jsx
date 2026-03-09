import { io } from "socket.io-client";

export const socket = io("https://chatapp-backend.onrender.com", {
  withCredentials: true,
});