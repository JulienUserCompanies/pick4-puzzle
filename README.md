# Pick 4 — puzzle MVP

Tap any 4 numbers on the grid that add up to the target. Built with Expo
(React Native) so one codebase ships to iOS, Android, and web.

## Run it (today, on your phone, 2 minutes)

1. Install [Node.js](https://nodejs.org) if you don't have it.
2. In this folder: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase project's URL and
   anon/publishable key (Project Settings → API Keys in the Supabase
   dashboard). The app won't start without these — see "Accounts & backend"
   below if you don't have a Supabase project yet.
4. `npm start` — this opens Expo's dev tools in your terminal/browser.
5. Install the free **Expo Go** app on your phone (App Store / Play Store).
6. Scan the QR code Expo prints. The game opens live on your phone, no
   build or store account needed. Edits you make to the code show up
   instantly (hot reload).

`npm run web` also runs it straight in a browser tab, no phone needed.

## What's in here

- `App.tsx` — entry point, navigator, Splash → Onboarding → Home flow
- `src/theme.ts` — shared colors/radii/shadows/mascot assets, matching the
  Claude Artifacts mockup's warm cream/orange look
- `src/engine/` — the puzzle generator (guarantees a valid combo exists,
  tunes difficulty by level, rejects puzzles that are too easy/too hard for
  their tier)
- `src/screens/GameScreen.tsx` — the whole game loop: grid, running total,
  submit, win/lose feedback, next puzzle (also plays a fetched Daily
  Challenge puzzle when navigated to with `daily: true`)
- `src/screens/WinScreen.tsx` — celebration screen: the bear mascot,
  confetti, and a DeviceMotion-driven tilt (tilt your phone and the bear
  leans with it — falls back to static if the sensor/permission isn't
  available, e.g. on web or in the simulator)
- `src/screens/HomeScreen.tsx` / `LevelsScreen.tsx` / `DailyScreen.tsx` /
  `LeaderboardScreen.tsx` / `StatisticsScreen.tsx` / `ProfileScreen.tsx` —
  the hub, classic level grid, Daily Challenge, today's leaderboard,
  locally-computed stats, and the profile tab
- `src/components/NumberTile.tsx` — a single tappable number tile
  (Reanimated tap + pop animation)
- `src/components/{GradientButton,Mascot,Confetti,BottomNav}.tsx` — shared
  "juicy" UI building blocks used across the new screens
- `assets/mascot/` — the bear mascot, one PNG per pose (idle, waving,
  thinking, confused, celebrating)

This started as the MVP scope from the original design doc (one screen,
tap-to-select, win/lose, a working difficulty curve) and has since been
reskinned and expanded to match the full mockup: Splash/Onboarding, a real
Home hub with a Daily Challenge banner, and Leaderboard/Statistics/Profile
tabs. Two things called out in the mockup don't exist here on purpose —
**Timed** and **Weekly Challenge** modes are shown as "Coming soon" cards
rather than built, since there's no game-mode logic or backend for either
yet; building fake-looking-real buttons for them would be worse than
leaving them honestly disabled.

**New since the reskin:** `supabase/migrations/0002_leaderboard_profiles.sql`
adds a public-read policy on `profiles.display_name` so the Daily Challenge
leaderboard can show *other* players' names (0001's policy only let you
read your own row). Run it the same way as 0001 (SQL Editor, or
`supabase db push`) after pulling this.

## Accounts & backend (Supabase)

- `supabase/migrations/0001_init.sql` — the full schema (`profiles`,
  `progress`, `daily_challenges`, `daily_results`) with row-level security
  policies. Run it in your project's SQL Editor (or `supabase db push` if
  you use the CLI).
- `src/lib/supabase.ts` — the client, reading `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env`.
- `src/storage/AuthContext.tsx` — sign up, sign in, sign out, delete
  account. Signing up automatically pushes any existing guest (on-device)
  progress to the new account, so nothing is lost.
- `src/storage/ProgressContext.tsx` — reads/writes `progress` from Supabase
  when signed in, falls back to on-device storage as a guest or when
  offline.
- Players are **never forced to sign in** — the app works fully as a guest
  from first launch; an account is offered (from Settings) to sync progress
  across devices.
- `supabase/functions/delete-account/` — an edge function for account
  deletion (required by Apple's App Store guidelines once you collect
  accounts). Deploy with `supabase functions deploy delete-account`, and
  set its `SUPABASE_SERVICE_ROLE_KEY` secret in the Supabase dashboard
  (Project Settings → Edge Functions) — never put that key in the app
  itself.

Still open from the accounts checklist: Sign in with Apple (required if you
ever add Google/Facebook sign-in), the Daily Challenge/leaderboard UI, and
the privacy policy page the App/Play Store will require once accounts are
live.

## Going from "runs on my phone via Expo Go" to "live in the App Store"

This is the part that needs **you**, not more code — app store accounts are
tied to a real identity and a payment method, so this step can't be
delegated:

1. **Apple**: enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/yr). Needs your identity verified — budget a
   few days.
2. **Google**: create a [Play Console account](https://play.google.com/console/) ($25 one-time). **Do this
   today regardless of when you plan to submit** — a new personal account
   must run a 14-day closed test with 12 testers before it can go live, and
   that clock only starts once you begin testing.
3. Once you have both accounts, come back and I'll set up **EAS Build +
   EAS Submit** (Expo's cloud build service) to produce the actual
   App Store / Play Store binaries and submit them — no Xcode or Android
   Studio needed on your end.

Realistic timeline: iOS can be live in roughly a week if review goes
smoothly. Android's 14-day testing requirement means it's closer to three
weeks for a brand-new account, even though the code is identical.
