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
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: SlotStatus;
  lockedBy: string | null;
  lockedUntil: string | null;
  bookedBy: string | null;
}

export interface SlotsQuery {
  turfId: string;
  date: string;
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
