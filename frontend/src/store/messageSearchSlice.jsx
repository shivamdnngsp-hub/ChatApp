import { createSlice } from "@reduxjs/toolkit";

const messageSearchSlice = createSlice({
    name:"messageSearch",
    initialState:{
        results: []
    },
    reducers:{
        setMessageResults:(state,action)=>{
            state.results = action.payload
        },
        clearMessageResults:(state,action)=>{
            state.results = []
        }
    }
})
export const {setMessageResults, clearMessageResults} = messageSearchSlice.actions
export default messageSearchSlice.reducer;