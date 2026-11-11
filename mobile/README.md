# Relay for Android and iOS

Expo / React Native app shell using React Native WebView. It opens the hosted Relay web app and shares its backend, accounts and database. This is a hybrid app, not a separately reimplemented native feed.

## Run
Install Node 22 LTS. From this directory run `npm install`, then `npx expo install --fix` to align dependencies with the installed Expo SDK. Run `npm start` and open through Expo Go on an iPhone or Android device. Android emulator: `npm run android`. iOS simulator requires macOS: `npm run ios`.

## Build
Use `npx eas-cli login` and `npx eas-cli build:configure` under your own Expo account. Android test APK: `npx eas-cli build --platform android --profile preview`. Production: `npx eas-cli build --platform all --profile production`. Set your own unique application identifiers before distributing. iOS device/store builds require Apple signing credentials; store publication requires developer accounts and review. No signing credentials are included.

## Included
Safe-area layout, Android back navigation, pull to refresh, native share, media file selection through WebView, network error/retry UI, and relay:// deep-link handling. For example `relay://story?scene=SCENE_ID`. Links shared from the app are HTTPS links; automatic verified universal/app links are not configured.

## Verification limits
Native builds and physical-device tests have not been performed. Test ChatGPT sign-in, session cookies, uploads, video playback, share sheets and permission prompts on both platforms before distributing. The hosted service is owner-private, so other testers cannot access it until its audience is deliberately changed. An app shell does not change that access policy. There are no push notifications, background uploads or offline story creation. Authentication provider policies may require an external-browser auth flow before public release. Never inject user identity headers or bypass hosted authentication.
