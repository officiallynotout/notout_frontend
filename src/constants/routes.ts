export const ROUTES = {
  SPLASH: 'Splash',

  AUTH:        'Auth',
  PHONE_ENTRY: 'PhoneEntry',
  OTP_VERIFY:  'OTPVerify',

  APP:               'App',
  TABS:              'Tabs',
  HOME:              'Home',
  TURF_DETAIL:       'TurfDetail',
  DATE_SLOT:         'DateSlot',
  SLOT_LOCK:         'SlotLock',
  BOOKING_CONFIRM:   'BookingConfirm',
  BOOKING_SUCCESS:   'BookingSuccess',
  MY_BOOKINGS:       'MyBookings',
  PROFILE:           'Profile',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteName = (typeof ROUTES)[RouteKey];
