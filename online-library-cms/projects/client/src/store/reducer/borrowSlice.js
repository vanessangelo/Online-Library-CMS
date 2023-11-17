import { createSlice } from "@reduxjs/toolkit";

export const borrowSlice = createSlice({
  name: "borrow",
  initialState: { ongoingBook: {}, isOngoing: false },
  reducers: {
    getOngoingBook(state, action) {
      state.ongoingBook = action.payload;
    },

    removeOngoingBook(state) {
      state.ongoingBook = {};
    },

    updateIsOngoing(state, action) {
      state.isOngoing = action.payload;
    },

    removeIsOngoing(state) {
      state.isOngoing = false;
    },
  },
});

export const { getOngoingBook, removeOngoingBook, updateIsOngoing, removeIsOngoing } =
  borrowSlice.actions;

export default borrowSlice.reducer;
