# 🔧 Environment Variables Setup Guide

This guide will walk you through setting up all the necessary environment variables for the Resume Manager authentication system.

## 📋 Required Environment Variables

### 1. Database Configuration ✅
Your database is already configured:
```env
DATABASE_URL="postgresql://postgres.lrdgewgbzllklbesbdck:ResumeManager@123@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

### 2. NextAuth.js Secret 🔑
**IMPORTANT**: Generate a secure secret for production:

```bash
# Generate a secure secret (run this in PowerShell):
openssl rand -hex 32
# OR use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Replace `your-super-secret-key-at-least-32-characters-long-for-production` with the generated value.

## 🚀 OAuth Provider Setup

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name: "Resume Manager"

4. **Configure Redirect URIs**
   ```
   Authorized JavaScript origins:
   http://localhost:3000
   https://your-domain.com (for production)

   Authorized redirect URIs:
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google (for production)
   ```

5. **Copy Credentials to .env**
   ```env
   GOOGLE_CLIENT_ID=728150885728-atn26o9ikjkno0n6biahsssu2jreaktf.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   ```

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click "OAuth Apps" > "New OAuth App"

2. **Configure OAuth App**
   ```
   Application name: Resume Manager
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. **Copy Credentials to .env**
   ```env
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```

## 🔄 Quick Setup Commands

### Generate NextAuth Secret
```powershell
# Run in PowerShell to generate a secure secret:
Add-Type -AssemblyName System.Security
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32)
[System.Convert]::ToHex($bytes)
```

### Test Your Setup
```bash
# Start the development server:
npm run dev

# Visit these URLs to test:
# http://localhost:3000 - Main app
# http://localhost:3000/api/auth/signin - Sign-in page
# http://localhost:3000/api/auth/providers - Available providers
```

## 🏷️ Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | ✅ Yes | Your app URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for JWT signing | 32+ character random string |
| `GOOGLE_CLIENT_ID` | 🔶 Optional | Google OAuth client ID | `abc123.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | 🔶 Optional | Google OAuth secret | `GOCSPX-abc123` |
| `GITHUB_ID` | 🔶 Optional | GitHub OAuth client ID | `abc123def456` |
| `GITHUB_SECRET` | 🔶 Optional | GitHub OAuth secret | `abc123def456ghi789` |
| `GEMINI_API_KEY` | 🔶 Optional | For AI features | `your-gemini-key` |

## 🔒 Security Notes

1. **Never commit real secrets to git**
2. **Use different secrets for development/production**
3. **Rotate secrets regularly in production**
4. **Use HTTPS in production**
5. **Keep OAuth redirect URIs specific**

## ✅ Verification Steps

After setting up your environment variables:

1. **Check NextAuth endpoints**:
   ```
   GET http://localhost:3000/api/auth/providers
   GET http://localhost:3000/api/auth/signin
   ```

2. **Test OAuth flows**:
   - Visit sign-in page
   - Click provider buttons
   - Verify redirects work

3. **Check database connection**:
   - Create a test profile
   - Verify user data is saved

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid client" error**
   - Check OAuth credentials are correct
   - Verify redirect URIs match exactly

2. **"NEXTAUTH_SECRET" error**
   - Ensure secret is at least 32 characters
   - No spaces or special characters

3. **Database connection issues**
   - Check DATABASE_URL format
   - Verify database is accessible

4. **OAuth redirect issues**
   - Ensure URLs match exactly (including protocol)
   - Check for trailing slashes

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal logs
3. Verify all environment variables are set
4. Test with `NEXTAUTH_DEBUG=true` for detailed logs

---

**Your app will work with placeholder OAuth values for basic testing, but you'll need real credentials for full OAuth functionality!**