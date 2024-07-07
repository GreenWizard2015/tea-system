import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastOperationDuration: 0,
  prevTeaLevel: 0,
  startTeaLevel: 0,
  estimatedTeaLevel: 50,
  estimation: true,
}

export const TempSlice = createSlice({
  name: 'Temp',
  initialState: initialState,
  reducers: {
    changeLastOperationDuration: (state, action) => {
      state.lastOperationDuration = action.payload;
    },
    changeEstimatedTeaLevel: (state, action) => {
      if (state.estimation) {
        state.estimatedTeaLevel = action.payload;
      }
    },
    pumpStartedEvent: (state, action) => {
      state.prevTeaLevel = state.startTeaLevel;
      state.estimation = true;
    },
    changeStartTeaLevel: (state, action) => {
      state.startTeaLevel = action.payload;
      state.estimatedTeaLevel = state.startTeaLevel;
      state.estimation = false;
    },
  }
});

export const actions = TempSlice.actions;
export const { 
  changeLastOperationDuration, 
  changeEstimatedTeaLevel, 
  pumpStartedEvent, 
  changeStartTeaLevel
} = actions;