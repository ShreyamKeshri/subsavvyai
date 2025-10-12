# Spotify OAuth Setup Guide

This guide walks you through setting up Spotify OAuth for the Smart Downgrade Alerts feature in SubSavvyAI.

## Why Spotify OAuth?

Spotify OAuth enables the **Smart Downgrade Alerts** feature - SubSavvyAI's unique AI-powered value proposition:
- Tracks real usage data from Spotify API (listening hours, playback history)
- Generates personalized AI recommendations
- Suggests downgrading to Free tier if usage < 10 hours/month (saves ₹1,428/year)
- Recommends canceling if usage < 2 hours/month

## Prerequisites

- A Spotify account (Free or Premium)
- Access to [Spotify for Developers](https://developer.spotify.com/dashboard)

## Step 1: Create Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **"Create app"**
3. Fill in the details:
   - **App name**: SubSavvyAI (or your preferred name)
   - **App description**: AI-powered subscription optimizer that analyzes Spotify usage to provide smart downgrade recommendations
   - **Redirect URI**: `http://127.0.0.1:3000/api/oauth/spotify/callback`
   - **Which API/SDKs are you planning to use?**: Check **Web API**

   **Important**: Spotify requires explicit loopback addresses (127.0.0.1 or [::1]) for local development. `localhost` is NOT allowed.
4. Accept Spotify's Terms of Service
5. Click **"Save"**

## Step 2: Get Your Credentials

1. In your app dashboard, click **"Settings"**
2. You'll see:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "View client secret" and copy this value

## Step 3: Configure Environment Variables

1. Open your `.env.local` file (create one if it doesn't exist)
2. Add the following variables:

```env
# App URL (for Google OAuth, email redirects, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Spotify OAuth (requires separate redirect URI)
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/oauth/spotify/callback
```

3. Replace `your_client_id_here` and `your_client_secret_here` with the values from Step 2

**Important Notes:**
- `NEXT_PUBLIC_APP_URL` uses `localhost` for general app usage (Google OAuth, etc.)
- `SPOTIFY_REDIRECT_URI` uses `127.0.0.1` specifically for Spotify (Spotify requires explicit loopback address)
- This separation prevents OAuth conflicts between providers

## Step 4: Update Redirect URI for Production

When deploying to production (e.g., Vercel):

1. Go back to your Spotify app settings
2. Add production redirect URI:
   - `https://yourdomain.com/api/oauth/spotify/callback`
3. Update your production environment variables:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   SPOTIFY_REDIRECT_URI=https://yourdomain.com/api/oauth/spotify/callback
   ```

## Step 5: Verify Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://127.0.0.1:3000/dashboard` (or `http://localhost:3000/dashboard` - both work for accessing the app)

3. Look for the "Connect Spotify" button

4. Click it and authorize the app

5. You should be redirected back to the dashboard with a success message

## What Data We Request

The app requests these Spotify API scopes:
- `user-read-recently-played` - View recently played tracks
- `user-top-read` - View top tracks and artists
- `user-read-playback-state` - View current playback state
- `user-read-currently-playing` - View currently playing track

**Privacy**: We only use this data to calculate usage hours and generate recommendations. We never share or sell your data.

## How It Works

1. **User connects Spotify** → OAuth tokens stored securely in database
2. **Periodic sync** → Fetches usage data from Spotify API
3. **AI analysis** → Calculates monthly listening hours
4. **Smart recommendations** → Suggests downgrade/cancel if low usage
5. **Dashboard display** → Shows potential savings (e.g., ₹1,428/year)

## Troubleshooting

### Error: "SPOTIFY_CLIENT_ID is not defined"
- Make sure you added the environment variables to `.env.local`
- Restart your development server after adding env variables

### Error: "Invalid redirect URI"
- Check that your redirect URI in Spotify app settings exactly matches: `http://127.0.0.1:3000/api/oauth/spotify/callback`
- Must use `127.0.0.1` (loopback address), NOT `localhost` - Spotify no longer allows localhost
- No trailing slash, must be exact match

### Error: "Invalid client credentials"
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces when copying

### OAuth flow succeeds but no recommendations appear
- Check that migration `005_smart_downgrade_alerts.sql` has been run in Supabase
- Verify the `oauth_tokens`, `service_usage`, and `optimization_recommendations` tables exist
- Check browser console for errors

## Database Requirements

The Spotify OAuth feature requires these database tables (created in migration 005):

- `oauth_tokens` - Stores encrypted access/refresh tokens
- `service_usage` - Stores usage data from Spotify API
- `optimization_recommendations` - Stores AI-generated recommendations

**Important**: Run migration 005 before testing Spotify OAuth!

## Security Notes

- Tokens are stored in the database (TODO: encrypt before storing in production)
- Access tokens expire after 1 hour, refresh tokens are used to get new ones
- Users can disconnect Spotify anytime from dashboard
- All API calls are server-side (tokens never exposed to browser)

## Need Help?

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [OAuth 2.0 Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- Check `lib/oauth/spotify.ts` for implementation details
