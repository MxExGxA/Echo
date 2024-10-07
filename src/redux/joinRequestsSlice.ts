import { joinRequest } from "../utils/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [] as joinRequest[],
};

const joinRequestsSlice = createSlice({
  name: "joinRequests",
  initialState,
  reducers: {
    addJoinRequest(state, action) {
      state.requests.push(action.payload);
    },
    removeJoinRequest(state, action) {
      state.requests = state.requests.filter(
        (req) => req.member.id !== action.payload
      );
    },
  },
});

export const { addJoinRequest, removeJoinRequest } = joinRequestsSlice.actions;
export default joinRequestsSlice.reducer;
