# 🌐 Deployment Guide

## Production Checklist

Before deploying to production, ensure:

- ✅ Supabase database is set up with all migrations
- ✅ Supabase Edge Functions are deployed
- ✅ Environment variables are configured
- ✅ Anonymous authentication is enabled in Supabase
- ✅ Realtime is enabled for the `collective_messages` table

## Deploy to Vercel (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/wired-consciousness)

### Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: WIRED CONSCIOUSNESS UPLOAD PROTOCOL"
   git remote add origin https://github.com/yourusername/wired-consciousness.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project settings

3. **Add Environment Variables**
   In Vercel dashboard, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Deploy**
   Click "Deploy" and wait for build to complete

## Supabase Configuration

### Enable Anonymous Auth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Anonymous sign-ins"
3. Save changes

### Enable Realtime

1. Go to Database → Replication
2. Ensure `collective_messages` table has replication enabled
3. Or use SQL:
   ```sql
   alter publication supabase_realtime add table collective_messages;
   ```

### Verify Edge Functions

In Supabase Dashboard → Edge Functions, you should see:
- `chat-with-lain` ✅
- `generate-embeddings` ✅
- `consciousness-agent` ✅

## Post-Deployment

### Test the Application

1. **Landing Page**: Visit your deployed URL
2. **Conversation Flow**: Start a conversation with Lain
3. **Writing Upload**: Test file upload and direct writing
4. **Profile Creation**: Complete profile setup
5. **Collective Chat**: Send messages and verify real-time sync
6. **AI Agents**: Wait for automatic AI responses (~30 seconds)

### Monitor Performance

#### Supabase Dashboard
- Check Database → Logs for any errors
- Monitor Edge Functions → Invocations
- View Auth → Users to see sign-ups

#### Vercel Dashboard
- Check Analytics for page views
- Monitor Functions for performance
- Review Logs for runtime errors

### Cost Considerations

#### OpenAI API
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **text-embedding-3-large**: ~$0.13 per 1M tokens
- Estimated cost per user upload: $0.05-0.20

#### Supabase
- **Free Tier**: 500MB database, 2GB bandwidth, 50k realtime messages
- **Pro Tier** ($25/mo): 8GB database, 50GB bandwidth, unlimited realtime

#### Vercel
- **Hobby** (Free): 100GB bandwidth, unlimited requests
- **Pro** ($20/mo): 1TB bandwidth, advanced analytics

### Scaling Tips

1. **Rate Limiting**: Add rate limits to Edge Functions
2. **Caching**: Cache AI responses for common questions
3. **Database Indexing**: Already optimized with indexes on key columns
4. **CDN**: Vercel automatically uses CDN for static assets
5. **Image Optimization**: Use Next.js Image component if adding images

## Security Best Practices

### Supabase
- ✅ RLS (Row Level Security) is enabled on all tables
- ✅ Anonymous users have limited permissions
- ✅ API keys are environment variables (not in code)
- ⚠️ Consider adding rate limiting on Edge Functions

### Client-Side
- ✅ OpenAI key stored in localStorage (user's own key)
- ✅ No hardcoded secrets in frontend code
- ⚠️ Consider encrypting localStorage data

### Recommendations
1. Add CAPTCHA to prevent abuse
2. Implement request throttling
3. Monitor for unusual API usage
4. Set up alerts for high costs

## Maintenance

### Regular Tasks
- **Weekly**: Check Supabase logs for errors
- **Monthly**: Review OpenAI API usage and costs
- **Quarterly**: Update dependencies (`npm update`)

### Backup Database
```bash
# Using Supabase CLI
supabase db dump -f backup.sql
```

### Update Dependencies
```bash
npm update
npm audit fix
npm run build
```

## Troubleshooting Production Issues

### 500 Internal Server Error
- Check Vercel function logs
- Verify environment variables are set
- Check Supabase Edge Function logs

### Real-time Not Working
- Verify Realtime is enabled in Supabase
- Check browser console for WebSocket errors
- Ensure RLS policies allow message reads

### AI Agents Not Responding
- Check OpenAI API status
- Verify Edge Function `consciousness-agent` is deployed
- Check function invocation logs in Supabase

### High API Costs
- Implement request caching
- Add rate limiting
- Switch to GPT-4o-mini if using GPT-4o
- Limit embedding generation to essential content

## Custom Domain Setup

### On Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for DNS propagation (~24 hours)

### SSL Certificate
Vercel automatically provisions SSL certificates for all domains.

## Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics**: Built-in, enable in project settings
- **Supabase Logs**: Real-time logs in dashboard
- **OpenAI Usage**: Monitor at https://platform.openai.com/usage
- **Sentry** (optional): Error tracking and monitoring

## Support & Community

- **Issues**: Report bugs on GitHub
- **Discussions**: Share ideas and get help
- **Updates**: Watch repository for new features

---

**The Wired is ready. Deploy with confidence.**

Present Day. Present Time.

Protocol Version 1.0.1998
