# Pick 4 — puzzle MVP

Tap any 4 numbers on the grid that add up to the target. Built with Expo
(React Native) so one codebase ships to iOS, Android, and web.

## Run it (today, on your phone, 2 minutes)

1. Install [Node.js](https://nodejs.org) if you don't have it.
2. In this folder: `npm install`
3. `npm start` — this opens Expo's dev tools in your terminal/browser.
4. Install the free **Expo Go** app on your phone (App Store / Play Store).
5. Scan the QR code Expo prints. The game opens live on your phone, no
   build or store account needed. Edits you make to the code show up
   instantly (hot reload).

`npm run web` also runs it straight in a browser tab, no phone needed.

## What's in here

- `App.tsx` — entry point
- `src/engine/` — the puzzle generator (guarantees a valid combo exists,
  tunes difficulty by level, rejects puzzles that are too easy/too hard for
  their tier)
- `src/screens/GameScreen.tsx` — the whole game loop: grid, running total,
  submit, win/lose feedback, next puzzle
- `src/components/NumberTile.tsx` — a single tappable number tile

This is the MVP scope from the design doc: one screen, tap-to-select, a
live running total with color feedback, win/lose, and a working difficulty
curve (easy → mid → hard as the level number climbs). No accounts, ads, or
backend — nothing to host or pay for yet.

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
