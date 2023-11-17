import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import auth from "./reducer/authSlice";
import borrow from "./reducer/borrowSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, combineReducers({ auth, borrow }))

export const store = configureStore({
  reducer: persistedReducer,
});

export default store;
