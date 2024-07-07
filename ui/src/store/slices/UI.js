import { createSlice } from '@reduxjs/toolkit';

function validatePowerLevel(value) {
  if (!Number.isInteger(value)) {
    value = 1;
  }
  value = Math.min(value, 100);
  value = Math.max(value, 1);
  return value;
}

const INITIAL_STATE = {
  pouringTime: 1000,
  powerLevelInPercents: 100,
  apiHost: '',
  speed: 10,
};
// slice for system status
export const UISlice = createSlice({
  name: 'UI',
  initialState: INITIAL_STATE,
  reducers: {
    updatePouringTime(state, action) {
      state.pouringTime = action.payload;
    },
    updateAPIHost(state, action) {
      state.apiHost = action.payload;
    },
    updatePowerLevel(state, action) {
      state.powerLevelInPercents = validatePowerLevel(action.payload);
    },
    changeSpeed(state, action) {
      state.speed = action.payload;
    },
  },
});

export const actions = UISlice.actions;
export const { updatePouringTime, updateAPIHost, updatePowerLevel, changeSpeed } = actions;