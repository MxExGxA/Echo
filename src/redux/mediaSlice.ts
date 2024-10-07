import { mediaType } from "../utils/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: { media: { [key: string]: mediaType }[] } = {
  media: [],
};

const mediaSlice = createSlice({
  initialState,
  name: "media",
  reducers: {
    setMedia: (state, action) => {
      state.media = [];
      Object.keys(action.payload).forEach((key) =>
        state.media.push({ [key]: action.payload[key] })
      );
    },
  },
});

export const { setMedia } = mediaSlice.actions;
export default mediaSlice.reducer;
