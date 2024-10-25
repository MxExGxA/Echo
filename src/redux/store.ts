import { configureStore } from "@reduxjs/toolkit";
import joinRequestsSlice from "./joinRequestsSlice";
import messagesSlice from "./messagesSlice";
import membersSlice from "./membersSlice";
import mediaSlice from "./mediaSlice";
import producersSlice from "./producersSlice";
import debugSlice from "./DebugSlice";
const store = configureStore({
  reducer: {
    joinReqs: joinRequestsSlice,
    members: membersSlice,
    messages: messagesSlice,
    media: mediaSlice,
    producers: producersSlice,
    debug: debugSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type stateType = ReturnType<typeof store.getState>;
export default store;
