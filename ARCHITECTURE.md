# NotOut — Frontend Architecture

Turf booking mobile app for Android & iOS built with **Expo Dev Client + TypeScript**.

---

## Tech Stack

| Concern              | Library                                      |
|----------------------|----------------------------------------------|
| Framework            | Expo SDK 52 (Dev Client)                     |
| Language             | TypeScript (strict mode)                     |
| Navigation           | React Navigation 6 (Native Stack + Bottom Tabs) |
| Global state         | Redux Toolkit + redux-persist                |
| Server state / cache | TanStack React Query v5                      |
| HTTP client          | Axios (with interceptor-based token refresh) |
| Animations           | Moti (Framer Motion–like API) + Reanimated 3 |
| Forms + validation   | React Hook Form + Zod                        |
| Font                 | Space Grotesk (via @expo-google-fonts)       |
| Icons                | @expo/vector-icons (Ionicons)                |
| Images               | expo-image (cached, performant)              |
| Haptics              | expo-haptics                                 |
| OTP input            | react-native-otp-entry                       |
| Calendar             | react-native-calendars                       |
| Date formatting      | date-fns                                     |

---

## Design System

### Color Palette

| Token                  | Value      | Usage                          |
|------------------------|------------|--------------------------------|
| `colors.bg.primary`    | `#0D0D0D`  | Screen backgrounds             |
| `colors.bg.secondary`  | `#141414`  | Cards, elevated surfaces       |
| `colors.bg.tertiary`   | `#1A1A1A`  | Inputs, sheets                 |
| `colors.bg.border`     | `#252525`  | Card and input borders         |
| `colors.text.primary`  | `#F5F5F5`  | Main readable text             |
| `colors.text.secondary`| `#8A8A8A`  | Supporting text                |
| `colors.olive.primary` | `#8A9B5C`  | Brand accent, buttons, CTAs    |
| `colors.olive.dark`    | `#6B7A45`  | Pressed / dark olive states    |
| `colors.olive.light`   | `#B0C47A`  | Subtle olive highlights        |
| `colors.status.error`  | `#E05252`  | Errors, destructive actions    |
| `colors.status.warning`| `#D4A84B`  | Locked slots, timer warnings   |
| `colors.status.success`| `#5E9E7A`  | Confirmed bookings             |

### Typography

Font: **Space Grotesk**

| Weight     | Font family name                  | Usage                    |
|------------|-----------------------------------|--------------------------|
| Regular    | `SpaceGrotesk_400Regular`         | Body, captions           |
| Medium     | `SpaceGrotesk_500Medium`          | Labels, secondary text   |
| SemiBold   | `SpaceGrotesk_600SemiBold`        | Subheadings, buttons     |
| Bold       | `SpaceGrotesk_700Bold`            | Headings, prices         |

Always use the `<AppText>` component — never use `<Text>` directly in screens/components.

---

## Project Structure

```
notout_frontend/
├── App.tsx                         # Entry: providers, font loading
├── app.json                        # Expo config
├── babel.config.js                 # Babel + module-resolver + reanimated
├── tsconfig.json                   # TS strict + @/* path alias
├── .env.example                    # Environment variable template
│
└── src/
    ├── api/
    │   ├── client.ts               # Axios instance, token injection, 401 refresh
    │   ├── auth.api.ts             # register, login, verifyOtp, firebase, me, refresh, logout
    │   ├── turf.api.ts             # getTurfs, getTurfById
    │   ├── slot.api.ts             # getSlots, lockSlot, releaseSlot
    │   ├── booking.api.ts          # createBooking, getMyBookings, getBookingById, cancelBooking
    │   └── user.api.ts             # getProfile, updateProfile
    │
    ├── components/
    │   ├── ui/                     # Atomic, reusable primitives
    │   │   ├── AppText.tsx         # All text — enforces Space Grotesk
    │   │   ├── Button.tsx          # Pressable + Moti scale animation + haptics
    │   │   ├── Input.tsx           # Animated border focus, error state
    │   │   ├── Card.tsx            # Surface container with border + optional shadow
    │   │   ├── Badge.tsx           # Status pill (success / warning / olive / etc.)
    │   │   └── Skeleton.tsx        # Pulsing loading placeholder
    │   │
    │   └── common/                 # Composed, domain-aware components
    │       ├── Header.tsx          # Screen header with back button
    │       ├── EmptyState.tsx      # Empty list UI with icon + CTA
    │       ├── TurfCard.tsx        # Turf listing card with staggered animation
    │       ├── SlotChip.tsx        # Time slot selector chip
    │       ├── BookingCard.tsx     # Booking history row with cancel
    │       └── LoadingOverlay.tsx  # Full-screen modal loading state
    │
    ├── constants/
    │   ├── colors.ts               # Full color tokens
    │   ├── typography.ts           # Font families, sizes, line heights
    │   ├── spacing.ts              # Spacing scale + border radius
    │   └── routes.ts               # Route name string constants
    │
    ├── hooks/
    │   ├── useAuth.ts              # Login, logout, patchUser helpers
    │   └── useHaptics.ts           # Typed haptic feedback helpers
    │
    ├── navigation/
    │   ├── RootNavigator.tsx       # Top-level: Splash → Auth | App
    │   ├── AuthNavigator.tsx       # PhoneEntry → OTPVerify
    │   ├── AppNavigator.tsx        # Tabs + booking flow stack
    │   └── TabNavigator.tsx        # Home / MyBookings / Profile tabs
    │
    ├── screens/
    │   ├── Splash/SplashScreen.tsx
    │   ├── Auth/
    │   │   ├── PhoneEntryScreen.tsx
    │   │   └── OTPVerifyScreen.tsx
    │   ├── Home/HomeScreen.tsx
    │   ├── TurfDetail/TurfDetailScreen.tsx
    │   ├── Booking/
    │   │   ├── DateSlotScreen.tsx
    │   │   ├── SlotLockScreen.tsx
    │   │   ├── BookingConfirmScreen.tsx
    │   │   └── BookingSuccessScreen.tsx
    │   ├── MyBookings/MyBookingsScreen.tsx
    │   └── Profile/ProfileScreen.tsx
    │
    ├── store/
    │   ├── index.ts                # configureStore, RootState, AppDispatch
    │   ├── persistConfig.ts        # AsyncStorage persist config (auth slice only)
    │   └── slices/
    │       ├── authSlice.ts        # user, accessToken, refreshToken, isAuthenticated
    │       └── bookingSlice.ts     # In-flight booking flow state
    │
    ├── types/
    │   ├── api.types.ts            # All API request/response interfaces
    │   └── navigation.types.ts     # Typed param lists for all navigators
    │
    └── utils/
        └── formatters.ts           # formatDate, formatTime, formatCurrency, maskPhone
```

---

## State Management Strategy

### Redux Toolkit (persisted)
Used for **session state** that lives across app restarts:
- `auth` slice: `user`, `accessToken`, `refreshToken`, `isAuthenticated`

Persisted to `AsyncStorage` via `redux-persist`.

### Booking Slice (not persisted)
Temporary in-memory state for the active booking flow:
- `selectedTurfId`, `selectedDate`, `selectedSlotId`, etc.
- Reset via `resetBookingFlow()` after booking success or cancellation.

### React Query (TanStack)
Used for all **server state**:
- `['turfs']` — turf listing (2 min stale time)
- `['turf', id]` — turf detail (5 min stale time)
- `['slots', turfId, date]` — slot grid (no stale — always fresh)
- `['my-bookings']` — user's booking history (30s stale)

---

## Authentication Flow

```
App Start
  └── Check persisted Redux state
        ├── isAuthenticated = true  → navigate to App (Tabs)
        └── isAuthenticated = false → navigate to Auth (PhoneEntry)

Phone Entry
  ├── Login mode  → POST /auth/login    → navigate to OTPVerify
  └── Register mode → POST /auth/register → navigate to OTPVerify

OTP Verify
  └── POST /auth/verify-otp
        ├── Success → dispatch setAuth() → navigate replace to App
        └── Error   → shake animation + alert

Token Refresh (transparent, via axios interceptor)
  └── Any 401 response → POST /auth/refresh
        ├── Success → update accessToken in store → retry original request
        └── Failure → dispatch clearAuth() → navigate to Auth
```

---

## Booking Flow

```
Home → TurfDetail → DateSlot → SlotLock → BookingConfirm → BookingSuccess

1. HomeScreen
   - React Query: GET /turfs
   - Tap card → navigate to TurfDetail

2. TurfDetailScreen
   - React Query: GET /turfs/:id
   - Tap "Book a Slot" → navigate to DateSlot

3. DateSlotScreen
   - react-native-calendars for date selection
   - React Query: GET /slots?turfId=&date= (on date select)
   - Tap slot → navigate to SlotLock

4. SlotLockScreen
   - Shows booking summary
   - Tap "Hold This Slot" → POST /slots/lock → navigate to BookingConfirm

5. BookingConfirmScreen
   - Displays 10-min countdown from slot lock
   - Tap "Confirm" → POST /bookings → navigate replace to BookingSuccess
   - Tap "Release" → DELETE /slots/:id/release → navigate to Tabs

6. BookingSuccessScreen
   - Particle burst + checkmark animation (Moti)
   - hapticSuccess() on mount
   - "View My Bookings" / "Back to Home" → reset navigation stack
```

---

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://<your-backend-host>/mobile/v1
   ```
   - Android emulator: use `10.0.2.2` instead of `localhost`
   - iOS simulator: `localhost` works
   - Physical device: use your machine's local IP (e.g. `192.168.x.x`)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start with Expo Dev Client:
   ```bash
   npx expo start --dev-client
   ```

4. Build for device (requires EAS):
   ```bash
   npx eas build --profile development --platform android
   npx eas build --profile development --platform ios
   ```

---

## Adding New Screens

1. Add the screen to `src/types/navigation.types.ts` param lists
2. Create `src/screens/<Feature>/<Name>Screen.tsx`
3. Register in the appropriate navigator (`AppNavigator`, `AuthNavigator`, or `TabNavigator`)
4. Export from the screen file as a named export

---

## Code Conventions

- **No inline hex colors** — always import from `@/constants`
- **No raw `<Text>`** — always use `<AppText>`
- **Screens own their layout** — components are presentation-only
- **React Query for data** — no manual `useEffect` + `fetch` patterns
- **Redux only for session/flow state** — not for API cache
- **Zod schemas co-located with forms** — no separate validation files
- **All animations via Moti** unless gesture-driven (then Reanimated directly)
