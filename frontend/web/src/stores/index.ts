import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import shortcutReducer from "./modules/shortcut";
import globalReducer from "./modules/workspace";

const store = configureStore({
  reducer: {
    global: globalReducer,
    shortcut: shortcutReducer,
  },
});

type AppState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export default store;
