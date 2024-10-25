import { createSlice } from "@reduxjs/toolkit";

const initialState: { debugList: string[] } = {
  debugList: [],
};

const debugSlice = createSlice({
  name: "debug",
  initialState,
  reducers: {
    debug(state, action) {
      state.debugList.push(action.payload);
    },
  },
});

export const { debug } = debugSlice.actions;
export default debugSlice.reducer;
