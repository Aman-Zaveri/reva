# How to Get a Free Gemini API Key

## Step 1: Visit Google AI Studio
Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## Step 2: Sign In
- Sign in with your Google account
- If you don't have one, create a free Google account

## Step 3: Create API Key
1. Click "Create API Key" button
2. Select "Create API key in new project" (recommended)
3. Your API key will be generated instantly

## Step 4: Copy API Key
1. Copy the generated API key
2. **Important**: Save it somewhere safe as you won't be able to see it again

## Step 5: Add to Your Project
1. Open your `.env.local` file in the resume manager project
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyA...your_actual_key_here
   ```
3. Save the file
4. Restart your development server if it's running

## Benefits of Gemini API (Free Tier)
- ✅ **Completely Free** - No credit card required
- ✅ **Generous Limits** - 15 requests per minute, 1500 requests per day
- ✅ **High Quality** - Gemini 1.5 Flash model with excellent performance
- ✅ **Fast Response** - Optimized for speed
- ✅ **No Billing** - Never worry about unexpected charges

## Troubleshooting

### "API key not configured" error
- Make sure you copied the key correctly
- Ensure there are no extra spaces or quotes
- Restart your development server after adding the key

### "Failed to optimize resume" error  
- Check your internet connection
- Verify the API key is valid
- Make sure you haven't exceeded rate limits (very unlikely with generous limits)

### Rate Limits
The free tier includes:
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per minute**

This is more than enough for personal resume optimization use!

## Security Note
- Keep your API key private
- Never commit it to version control
- The `.env.local` file is already in `.gitignore`
