import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice"
import uiReducer from "./uiSlice"
import resultsReducer from "./resultSlice"
import onlineReducers from "./onlineSlice"
import serachMessageReducer from "./messageSearchSlice"
import selectedMessgaeReducer from "./selectedMessgaeSlice"
import chatListReducer from "./chatList";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    ui :  uiReducer,
    results:  resultsReducer,
    onlineUsers: onlineReducers,
    messageSearchResults: serachMessageReducer,
    selectedMessage : selectedMessgaeReducer,
     chatList: chatListReducer,
  },
});