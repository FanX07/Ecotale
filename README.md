# EcoTale App

This project wraps the EcoTale interactive prototype in a standard Vite app and prepares it for iOS/Android packaging with Capacitor.

## Real services prepared

- Supabase configuration and protected SQL schema for accounts, observations and community posts
- Native photo capture and location helpers for iPhone/Android
- Copy `.env.example` to `.env` and provide your Supabase Project URL and anon key to enable cloud connectivity

## Run locally

```bash
npm install
npm run dev
```

## Build for mobile packaging

```bash
npm run build
npm run cap:add:ios       # first time only
npm run cap:add:android   # first time only
npm run cap:sync
npm run cap:open:ios
```

The current prototype is intentionally kept intact in `public/prototype.html`; the next product step is migrating its screens into `src/` and connecting real data services.

## Run on an iPhone

1. Run `npm run build && npm run cap:sync`.
2. Open `ios/App/App.xcworkspace` in Xcode (not the `.xcodeproj` file).
3. In **Signing & Capabilities**, choose your Apple Account team.
4. Connect your iPhone, choose it as the run destination, and press Run.

The project has been compiled successfully for `iphoneos` without signing. An Apple Account supports personal on-device testing; Apple Developer Program membership is required to distribute through TestFlight or the App Store.

## Enable cloud data

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env` and add the project URL and anon key.
4. In Supabase Authentication URL settings, add the development and production redirect URLs used by the app.
