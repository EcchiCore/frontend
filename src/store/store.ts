import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import uploadReducer from './features/upload/uploadSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        upload: uploadReducer,
        dashboard: dashboardReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
