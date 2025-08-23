# Environment Variables Setup Guide

## Create your .env file

You need to create a `.env` file in your project root (`D:\MolecuQuest\.env`) with the following content:

```env
# NextAuth Configuration (Required to fix JWT errors)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-change-this-in-production-min32chars

# NVIDIA API for Molecule Generation
NEXT_PUBLIC_NVIDIA_API_KEY=your-nvidia-api-key-here

# Ably Real-time API Key (for chat functionality)
NEXT_PUBLIC_ABLY_API_KEY=your-ably-api-key-here

# MongoDB Connection (you already have this working)
MONGODB_URL=mongodb+srv://pythonharsh1234:QpElZHFjaNB5H0Fs@molecuquest.vhwtojo.mongodb.net/?retryWrites=true&w=majority&appName=MoleCuQuest

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Resend Email Service (for password reset emails)
RESEND_KEY=your-resend-api-key-here
```

## Where to get the API keys:

### 1. NEXTAUTH_SECRET (CRITICAL - Fixes JWT errors)
- Generate a secure random string (minimum 32 characters)
- You can use this command: `openssl rand -base64 32`
- Or use an online generator: https://generate-secret.vercel.app/32
- Or simply use: `your-super-secret-jwt-key-change-this-in-production-min32chars`

### 2. NVIDIA API Key
- Go to: https://build.nvidia.com/
- Sign up/login to NVIDIA NGC
- Navigate to the MolMIM model page
- Generate an API key
- This is needed for molecule generation functionality

### 3. Ably API Key  
- Go to: https://ably.com/
- Sign up for a free account
- Create a new app
- Copy the API key from your dashboard
- This is for real-time chat functionality

### 4. Resend API Key
- Go to: https://resend.com/
- Sign up for a free account
- Generate an API key
- This is for sending password reset emails

## Steps to create the .env file:

1. Open your project root directory: `D:\MolecuQuest`
2. Create a new file called `.env` (without any extension)
3. Copy the content above into the file
4. Replace the placeholder values with your actual API keys
5. Save the file
6. Restart your development server: `npm run dev`

## Important Notes:

- The `.env` file should NEVER be committed to git (it's already in .gitignore)
- Keep your API keys secure and never share them publicly
- For production, use different values and ensure they're properly secured
