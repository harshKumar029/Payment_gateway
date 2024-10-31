// store.js
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './slice/payoutsid';

const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});

export default store;