import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Turf } from './api.types';

// ─── Root ──────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  App: NavigatorScreenParams<AppStackParamList> | undefined;
};

// ─── Auth stack ────────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  PhoneEntry: undefined;
  OTPVerify: {
    phone: string;
  };
};

// ─── App stack (home + booking flow as modal/push) ────────────────────────────

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  TurfDetail: { turfId: string };
  DateSlot: { turfId: string; turfName: string };
  CricketNewMatch:    undefined;
  CricketStartInnings: { matchId: string; isSecondInnings?: boolean; target?: number };
  CricketLiveScoring: { matchId: string };
  CricketInningsBreak: { matchId: string };
  CricketMatchResult: { matchId: string };
  CricketSpectator:   { shareCode?: string };
  SlotLock: {
    turfId:    string;
    turfName:  string;
    boxName:   string;
    slotId:    string;
    date:      string;
    startTime: string;
    endTime:   string;
    price:     number;
  };
  BookingConfirm: {
    turfName:  string;
    boxName:   string;
    date:      string;
    startTime: string;
    endTime:   string;
    price:     number;
    slotId:    string;
  };
  BookingSuccess: {
    bookingId: string;
    turfName:  string;
    date:      string;
    startTime: string;
    endTime:   string;
  };
};

// ─── Bottom tabs (user) ────────────────────────────────────────────────────────

export type TabParamList = {
  Home:       undefined;
  MyBookings: undefined;
  Cricket:    undefined;
  Profile:    undefined;
};

// ─── Admin stack ───────────────────────────────────────────────────────────────

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminTurfs:     undefined;
  AdminSlots:     undefined;
  AdminBookings:  undefined;
};

export type AdminStackParamList = {
  AdminTabs:     NavigatorScreenParams<AdminTabParamList> | undefined;
  AdminTurfForm: { turf?: Turf };
};
