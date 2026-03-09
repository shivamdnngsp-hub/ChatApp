import { io } from "socket.io-client";

export const socket = io("https://chatapp-backend.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});