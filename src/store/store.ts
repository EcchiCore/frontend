import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import authReducer from './features/auth/authSlice';
import uploadReducer from './features/upload/uploadSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        auth: authReducer,
        upload: uploadReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
