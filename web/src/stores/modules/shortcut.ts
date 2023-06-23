import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  shortcutList: Shortcut[];
}

const shortcutSlice = createSlice({
  name: "shortcut",
  initialState: {
    shortcutList: [],
  } as State,
  reducers: {
    setShortcuts: (state, action: PayloadAction<Shortcut[]>) => {
      return {
        ...state,
        shortcutList: action.payload,
      };
    },
    createShortcut: (state, action: PayloadAction<Shortcut>) => {
      return {
        ...state,
        shortcutList: state.shortcutList.concat(action.payload).sort((a, b) => b.createdTs - a.createdTs),
      };
    },
    patchShortcut: (state, action: PayloadAction<Partial<Shortcut>>) => {
      return {
        ...state,
        shortcutList: state.shortcutList.map((s) => {
          if (s.id === action.payload.id) {
            return {
              ...s,
              ...action.payload,
            };
          } else {
            return s;
          }
        }),
      };
    },
    deleteShortcut: (state, action: PayloadAction<ShortcutId>) => {
      return {
        ...state,
        shortcutList: [...state.shortcutList].filter((shortcut) => shortcut.id !== action.payload),
      };
    },
  },
});

export const { setShortcuts, createShortcut, patchShortcut, deleteShortcut } = shortcutSlice.actions;

export default shortcutSlice.reducer;
