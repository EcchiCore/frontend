
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PageType } from '@/app/[locale]/member/dashboard/utils/types';

interface DashboardState {
    currentPage: PageType;
    mobileOpen: boolean;
}

const initialState: DashboardState = {
    currentPage: 'profile', // Default
    mobileOpen: false,
};

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<PageType>) => {
            state.currentPage = action.payload;
        },
        setMobileOpen: (state, action: PayloadAction<boolean>) => {
            state.mobileOpen = action.payload;
        },
        toggleMobile: (state) => {
            state.mobileOpen = !state.mobileOpen;
        },
    },
});

export const { setCurrentPage, setMobileOpen, toggleMobile } = dashboardSlice.actions;

export default dashboardSlice.reducer;
