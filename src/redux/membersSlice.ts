import { Admin, Member } from "../utils/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: { members: (Member | Admin)[] } = {
  members: [],
};

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    setMembers(state, action) {
      state.members = action.payload;
    },
    clearMembers(state) {
      state.members = [];
    },
  },
});

export const { setMembers, clearMembers } = membersSlice.actions;
export default membersSlice.reducer;
