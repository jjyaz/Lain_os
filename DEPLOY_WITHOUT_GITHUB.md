# Deploy to Vercel WITHOUT GitHub

## Quick Start (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to Project Directory
```bash
cd /path/to/your/project
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → wired-consciousness (or your choice)
- **In which directory is your code located?** → ./
- **Override settings?** → No

### Step 4: Add Environment Variables

After first deployment, add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
```
Enter: `https://fprfpyndrixhtrevduva.supabase.co`

```bash
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Enter: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcmZweW5kcml4aHRyZXZkdXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTk1NDMsImV4cCI6MjA3ODg5NTU0M30.91qLuhLs6c0c6cYxlXAS-B-mjpa3TNUGhKQbKW6tfhU`

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## That's It!

Your app is now live at the URL Vercel provides (e.g., `wired-consciousness.vercel.app`)

## For Future Updates

Simply run from your project directory:
```bash
vercel --prod
```

## Important Notes

1. **No GitHub needed** - Vercel CLI uploads files directly from your computer
2. **Images**: Replace the placeholder image files in `/public` with actual Lain images before deploying
3. **OpenAI Key**: Users enter their own OpenAI API key in the app (stored in browser localStorage)
4. **Supabase**: Database and Edge Functions are already configured

## Fix Image Issue

Before deploying, you need actual Lain images. The current files are corrupted. Either:

**Option A**: Find Lain images online and save them as:
- `public/red lain.jpg`
- `public/red lain copy.jpg`

**Option B**: Remove the image from the landing page by editing `app/page.tsx`:

Remove lines 75-79:
```jsx
<img
  src="/red lain copy.jpg"
  alt="Lain"
  className="h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
/>
```

## Alternative: Deploy via Vercel Dashboard

1. **Zip your project** (exclude `node_modules`, `.next`, `.env`)
2. Go to https://vercel.com/new
3. Click "Browse" and upload your zip file
4. Add environment variables in the dashboard
5. Click "Deploy"

---

**The Wired awaits your consciousness.**

Protocol Version 1.0.1998
