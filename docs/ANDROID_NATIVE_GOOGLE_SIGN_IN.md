# Android native Google Sign-In

OPS uses Android Credential Manager with Sign in with Google for the Capacitor Android host. The Android login page never opens the browser OAuth route. It asks Credential Manager for a Google ID token, first preferring accounts already authorized for OPS and then showing eligible device accounts if needed.

## Required Google Auth Platform setup

1. Register Android package `me.mohitrajsinh.ops` with the SHA-1 certificate fingerprint for every signing key used to install the app (debug and release).
2. Keep `GOOGLE_OAUTH_CLIENT_ID` set to the **Web application** OAuth client ID. Credential Manager requests an ID token for this value, and `/api/auth/google/native` verifies it as the token audience. Set `GOOGLE_ANDROID_CLIENT_ID` to the Android OAuth client ID only as a strict secondary audience allow-list entry for compatible legacy/native releases; do not send it to Credential Manager as `serverClientId`.
3. Set `SESSION_SECRET` and deploy the API over HTTPS. The native app uses `https://ops.mohitrajsinh.me` so the server can set the existing secure, HttpOnly OPS session cookie.
4. Test on a physical device or Play-enabled emulator that has at least one Google account signed in.

## Security boundary

The Android plugin returns only an ID token to the OPS web layer. The token is sent over HTTPS to the backend, which uses `google-auth-library` to validate its signature, audience, issuer, and expiry before finding or creating the user and issuing the OPS session. Google passwords are never available to OPS or stored by it.

The identity token grants sign-in only. Google Tasks and Gmail access remain separate, explicit browser-based consent flows because those scopes require OAuth authorization beyond native identity sign-in.
