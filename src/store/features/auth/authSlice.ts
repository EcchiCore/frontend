
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardUser } from '@/app/[locale]/member/dashboard/utils/types';
import { userApi, ApiError } from '@/app/[locale]/member/dashboard/utils/api';

interface AuthState {
    user: DashboardUser | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: true,
    error: null,
    initialized: false,
};

const CACHE_KEY = 'dashboard_user';

// Async Thunks
export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userApi.getUser();
            const user = response.user;
            localStorage.setItem(CACHE_KEY, JSON.stringify(user));
            return user;
        } catch (err) {
            // Check if it's a 401, if so, we might want to clear local storage
            if (err instanceof ApiError && err.status === 401) {
                localStorage.removeItem(CACHE_KEY);
            }
            return rejectWithValue(
                err instanceof ApiError ? err.message : 'Failed to fetch user data'
            );
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<DashboardUser | null>) => {
            state.user = action.payload;
            if (action.payload) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(action.payload));
            } else {
                localStorage.removeItem(CACHE_KEY);
            }
            state.loading = false;
        },
        updateUserLocal: (state, action: PayloadAction<Partial<DashboardUser>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem(CACHE_KEY, JSON.stringify(state.user));
            }
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.loading = false;
            localStorage.removeItem(CACHE_KEY);
            // Clear cookie
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        },
        initializeAuth: (state) => {
            // Optimistic load from localStorage
            try {
                const cachedUser = localStorage.getItem(CACHE_KEY);
                if (cachedUser) {
                    state.user = JSON.parse(cachedUser);
                }
            } catch (e) {
                console.error("Failed to parse cached user", e);
            }
            state.initialized = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, updateUserLocal, logout, initializeAuth } = authSlice.actions;

// Async Thunks wrapper for login (handles cookie setting which is sync, then fetch)
// Note: In Redux, side effects like setting cookies are often done in middleware or thunks.
// Here we mimic the existing hook's behavior.
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (token: string, { dispatch }) => {
        document.cookie = `token=${token}; path=/`;
        await dispatch(fetchUser());
    }
);

export default authSlice.reducer;
