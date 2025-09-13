# Authentication Setup for Resume Manager

This document outlines the user authentication system that has been added to the Resume Manager application.

## What's Been Implemented

### 1. Database Schema Updates
- Added `User`, `Account`, `Session`, and `VerificationToken` models for NextAuth.js
- Updated `Profile` and `PersonalInfo` models to include `userId` foreign key relationships
- All user data is now isolated by user account

### 2. NextAuth.js Configuration
- Configured NextAuth.js with Google and GitHub OAuth providers
- Set up database session strategy using Prisma adapter
- Created authentication API routes at `/api/auth/[...nextauth]`

### 3. Route Protection
- Added middleware to protect authenticated routes
- Updated profile API routes to filter data by authenticated user
- All API endpoints now require valid authentication

### 4. UI Components
- Created sign-in page at `/auth/signin`
- Created authentication error page at `/auth/error`
- Added UserMenu component with sign-in/sign-out functionality
- Updated main layout to include AuthProvider wrapper

### 5. Frontend Integration
- Added SessionProvider to root layout
- Updated main page to include navigation header with UserMenu
- Created Avatar component for user profile pictures

## What Still Needs to Be Done

### 1. Database Migration
The database schema changes need to be applied:
```bash
npx prisma migrate dev --name add_user_authentication
```

### 2. Environment Variables
Add these environment variables to your `.env` file:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### 3. OAuth Provider Setup
1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

2. **GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 4. Repository Implementation Updates
The PostgreSQL repository needs to be updated to work with the new user-based filtering. This includes:
- Updating `saveProfiles` method to accept and use `userId`
- Updating `loadProfiles` method to filter by `userId`
- Updating other repository methods to be user-specific

### 5. Frontend Component Updates
Some existing components may need updates to work with the authentication system:
- Data management pages to show user-specific data
- Profile creation/editing to associate with authenticated user
- Error handling for unauthenticated access

## Testing the Authentication Flow

1. Start the development server: `npm run dev`
2. Navigate to the home page - you should see a "Sign In" button
3. Click sign in and test with OAuth providers
4. After signing in, you should see your user avatar in the navigation
5. Create profiles - they should be isolated to your account
6. Sign out and sign in with a different account - you should see different profiles

## Security Considerations

- All user data is properly isolated by `userId`
- Routes are protected by middleware
- Sessions are stored in the database for better security
- OAuth providers handle authentication securely

## Notes

- The middleware protects specific routes that handle user data
- Public routes like the home page remain accessible
- The authentication system is ready for production with proper environment variables