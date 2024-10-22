import { producersType } from "../utils/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: { producers: producersType } = {
  producers: {},
};

const producersSlice = createSlice({
  name: "producers",
  initialState,
  reducers: {
    setProducers(state, action) {
      state.producers = action.payload;
    },
  },
});

export const { setProducers } = producersSlice.actions;
export default producersSlice.reducer;
