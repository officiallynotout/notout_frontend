// Generic API response envelope from the backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  phone: string;
}

export interface LoginPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface FirebaseLoginPayload {
  firebaseToken: string;
  name?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OtpResponse {
  message: string;
  otp?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

// ─── Turf ─────────────────────────────────────────────────────────────────────

export interface TurfLocation {
  address: string;
  city: string;
  pincode: string;
}

export interface OperatingHours {
  open: string;
  close: string;
}

export interface Turf {
  _id: string;
  name: string;
  description: string;
  location: TurfLocation;
  amenities: string[];
  images: string[];
  pricePerHour: number;
  operatingHours: OperatingHours;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TurfsQuery {
  city?:     string;
  search?:   string;
  isActive?: 'true' | 'false' | 'all';
}

export interface CreateTurfPayload {
  name:            string;
  description?:    string;
  location:        TurfLocation;
  amenities?:      string[];
  pricePerHour:    number;
  operatingHours?: OperatingHours;
}

export interface UpdateTurfPayload {
  name?:           string;
  description?:    string;
  location?:       Partial<TurfLocation>;
  amenities?:      string[];
  pricePerHour?:   number;
  operatingHours?: Partial<OperatingHours>;
  isActive?:       boolean;
}

export interface GenerateSlotsPayload {
  turfId:           string;
  date:             string;
  startTime:        string;
  endTime:          string;
  durationMinutes:  30 | 60 | 90 | 120;
  price:            number;
}

// ─── Slot ─────────────────────────────────────────────────────────────────────

export type SlotStatus = 'available' | 'locked' | 'booked';

export interface Slot {
  _id: string;
  turfId: string;
  boxId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: SlotStatus;
  effectiveStatus: SlotStatus;
  lockedBy: string | null;
  lockedUntil: string | null;
  bookedBy: string | null;
}

export interface Box {
  _id:      string;
  turfId:   string;
  name:     string;
  isActive: boolean;
}

export interface SlotsQuery {
  boxId: string;
  date:  string;
}

export interface LockSlotPayload {
  slotId: string;
}

export interface LockSlotResponse {
  message: string;
  slot: Slot;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  _id: string;
  user: string;
  turfName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  turfName:  string;
  date:      string;
  startTime: string;
  endTime:   string;
}

// ─── Cricket Scoreboard ───────────────────────────────────────────────────────

export type CricketMatchStatus    = 'SETUP' | 'IN_PROGRESS' | 'INNINGS_BREAK' | 'COMPLETED';
export type CricketInningsStatus  = 'IN_PROGRESS' | 'COMPLETED';
export type DismissalType =
  | 'BOWLED' | 'CAUGHT' | 'RUN_OUT' | 'LBW'
  | 'STUMPED' | 'HIT_WICKET' | 'RETIRED_HURT';

export interface CricketBatsmanScore {
  id:           string;
  playerName:   string;
  runs:         number;
  balls:        number;
  fours:        number;
  sixes:        number;
  strikeRate:   number;
  isOut:        boolean;
  dismissalType: DismissalType | null;
  battingOrder: number;
}

export interface CricketBowlerScore {
  id:         string;
  playerName: string;
  overs:      string;
  runs:       number;
  wickets:    number;
  maidens:    number;
  wides:      number;
  noBalls:    number;
  economy:    number;
}

export interface CricketBallRecord {
  id:                  string;
  overNumber:          number;
  ballNumber:          number;
  batsmanName:         string;
  bowlerName:          string;
  runs:                number;
  isWide:              boolean;
  isNoBall:            boolean;
  isBye:               boolean;
  isLegBye:            boolean;
  isWicket:            boolean;
  dismissalType:       DismissalType | null;
  dismissedBatsmanName: string | null;
  totalRuns:           number;
}

export interface CricketExtras {
  wides:   number;
  noBalls: number;
  byes:    number;
  legByes: number;
  total:   number;
}

export interface CricketInnings {
  id:                     string;
  inningsNumber:          1 | 2;
  battingTeam:            'team1' | 'team2';
  totalRuns:              number;
  totalWickets:           number;
  overs:                  string;
  runRate:                number;
  extras:                 CricketExtras;
  status:                 CricketInningsStatus;
  currentOverNumber:      number;
  currentLegalBallsInOver: number;
  currentBowlerName:      string | null;
  currentStrikeBatsman:   string | null;
  currentNonStrikeBatsman: string | null;
  batsmen:                CricketBatsmanScore[];
  bowlers:                CricketBowlerScore[];
  recentBalls:            CricketBallRecord[];
}

export interface CricketMatch {
  matchId:       string;
  shareCode:     string;
  team1Name:     string;
  team2Name:     string;
  battingFirst:  'team1' | 'team2';
  totalOvers:    number;
  playersPerSide: number;
  trackExtras:   boolean;
  status:        CricketMatchStatus;
  result:        string | null;
  createdAt:     string;
  innings:       CricketInnings[];
  target?:       number;
}

export interface CricketMatchListItem {
  matchId:    string;
  shareCode:  string;
  team1Name:  string;
  team2Name:  string;
  status:     CricketMatchStatus;
  result:     string | null;
  totalOvers: number;
  createdAt:  string;
  innings: {
    inningsNumber: 1 | 2;
    battingTeam:   'team1' | 'team2';
    totalRuns:     number;
    totalWickets:  number;
    overs:         string;
    status:        CricketInningsStatus;
  }[];
}

export interface CreateMatchPayload {
  team1Name:     string;
  team2Name:     string;
  battingFirst:  'team1' | 'team2';
  totalOvers:    number;
  playersPerSide: number;
  trackExtras:   boolean;
}

export interface LogBallPayload {
  batsmanName:          string;
  bowlerName:           string;
  runs?:                number;
  isWide?:              boolean;
  isNoBall?:            boolean;
  isBye?:               boolean;
  isLegBye?:            boolean;
  isWicket?:            boolean;
  dismissalType?:       DismissalType;
  dismissedBatsmanName?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminBookingUser {
  _id:   string;
  name:  string;
  phone?: string;
}

export interface AdminBooking extends Omit<Booking, 'user'> {
  user: AdminBookingUser;
}

export interface AdminStats {
  total:       number;
  confirmed:   number;
  cancelled:   number;
  pending:     number;
  today:       number;
  activeTurfs: number;
}
