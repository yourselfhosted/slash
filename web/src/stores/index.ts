import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import globalReducer from "./modules/global";
import userReducer from "./modules/user";
import shortcutReducer from "./modules/shortcut";

const store = configureStore({
  reducer: {
    global: globalReducer,
    user: userReducer,
    shortcut: shortcutReducer,
  },
});

type AppState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export default store;
