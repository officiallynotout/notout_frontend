import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingFlowState {
  selectedTurfId:   string | null;
  selectedTurfName: string | null;
  selectedDate:     string | null;  // YYYY-MM-DD
  selectedSlotId:   string | null;
  selectedStartTime: string | null;
  selectedEndTime:   string | null;
  selectedPrice:     number | null;
  lockedUntil:       string | null;
}

const initialState: BookingFlowState = {
  selectedTurfId:    null,
  selectedTurfName:  null,
  selectedDate:      null,
  selectedSlotId:    null,
  selectedStartTime: null,
  selectedEndTime:   null,
  selectedPrice:     null,
  lockedUntil:       null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    selectTurf: (state, action: PayloadAction<{ turfId: string; turfName: string }>) => {
      state.selectedTurfId   = action.payload.turfId;
      state.selectedTurfName = action.payload.turfName;
      state.selectedDate      = null;
      state.selectedSlotId    = null;
      state.selectedStartTime = null;
      state.selectedEndTime   = null;
      state.selectedPrice     = null;
      state.lockedUntil       = null;
    },
    selectDate: (state, action: PayloadAction<string>) => {
      state.selectedDate      = action.payload;
      state.selectedSlotId    = null;
      state.selectedStartTime = null;
      state.selectedEndTime   = null;
      state.selectedPrice     = null;
      state.lockedUntil       = null;
    },
    selectSlot: (
      state,
      action: PayloadAction<{
        slotId:    string;
        startTime: string;
        endTime:   string;
        price:     number;
      }>,
    ) => {
      state.selectedSlotId    = action.payload.slotId;
      state.selectedStartTime = action.payload.startTime;
      state.selectedEndTime   = action.payload.endTime;
      state.selectedPrice     = action.payload.price;
    },
    setLockedUntil: (state, action: PayloadAction<string>) => {
      state.lockedUntil = action.payload;
    },
    resetBookingFlow: () => initialState,
  },
});

export const { selectTurf, selectDate, selectSlot, setLockedUntil, resetBookingFlow } =
  bookingSlice.actions;

export default bookingSlice.reducer;
