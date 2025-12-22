
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Types
export interface DownloadEntry {
    name: string;
    url: string;
    submitNote?: string;
    isActive?: boolean;
    vipOnly?: boolean;
}

export interface AuthorizedSourceEntry {
    name: string;
    url: string;
    submitNote?: string;
}

export interface GameUploadFormData {
    // Step 1: Basic Info
    title?: string;
    creator?: string;
    ver?: string;
    description?: string;
    body?: string; // HTML content
    engine?: string;
    platforms?: string[];

    // Step 2: Categorization
    tags?: string[];
    categories?: string[];

    // Step 3: Media
    coverImage?: string; // URL or base64? Usually URL after upload
    screenshots?: string[]; // URLs

    // Step 4: Downloads
    downloads?: DownloadEntry[];
    authorizedPurchaseSources?: AuthorizedSourceEntry[];

    // Extras
    [key: string]: any;
}

interface UploadState {
    formData: GameUploadFormData;
    activeSection: string; // 'basic', 'categorization', 'media', 'downloads'
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    ongoingUploads: number; // For media upload tracking
}

const initialState: UploadState = {
    formData: {
        platforms: [],
        downloads: [],
        authorizedPurchaseSources: [],
        tags: [],
        categories: [],
        screenshots: []
    },
    activeSection: 'basic',
    status: 'idle',
    error: null,
    ongoingUploads: 0,
};

// Async Thunk for Submission
export const submitGameUpload = createAsyncThunk(
    'upload/submitGame',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as any;
        const { formData } = state.upload as UploadState;
        const token = Cookies.get('token');

        if (!token) {
            return rejectWithValue('You must be logged in to upload a game.');
        }

        try {
            // 1. Create Article
            const gameResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!gameResponse.ok) {
                const errorData = await gameResponse.json();
                throw new Error(errorData.message || 'Failed to create game article');
            }

            const gameJson = await gameResponse.json();
            const gameData = gameJson.data || gameJson;
            const articleId = gameData.article.id;

            // 2. Add Downloads (if any)
            if (formData.downloads && formData.downloads.length > 0) {
                for (const download of formData.downloads) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/downloads`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ ...download, articleId }),
                    });
                }
            }

            // 3. Add Purchase Sources (if any)
            if (formData.authorizedPurchaseSources && formData.authorizedPurchaseSources.length > 0) {
                for (const source of formData.authorizedPurchaseSources) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com'}/api/official-download-sources`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ ...source, articleId }),
                    });
                }
            }

            return articleId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred during upload.');
        }
    }
);

export const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        updateFormData: (state, action: PayloadAction<Partial<GameUploadFormData>>) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setStep: (state, action: PayloadAction<string>) => {
            state.activeSection = action.payload;
        },
        setOngoingUploads: (state, action: PayloadAction<number>) => {
            state.ongoingUploads = action.payload;
        },
        incrementOngoingUploads: (state) => {
            state.ongoingUploads += 1;
        },
        decrementOngoingUploads: (state) => {
            state.ongoingUploads = Math.max(0, state.ongoingUploads - 1);
        },
        resetUploadState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitGameUpload.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(submitGameUpload.fulfilled, (state) => {
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(submitGameUpload.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { updateFormData, setStep, setOngoingUploads, incrementOngoingUploads, decrementOngoingUploads, resetUploadState } = uploadSlice.actions;

export default uploadSlice.reducer;
