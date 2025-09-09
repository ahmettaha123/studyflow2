# Google OAuth Deployment Guide

## Yapılan Değişiklikler

1. **OAuth Callback Handler**: `/pages/api/auth/callback.js` eklendi
2. **Environment Variable**: `NEXT_PUBLIC_SITE_URL` desteği
3. **Dinamik Redirect**: Production/development için farklı URL'ler

## Netlify Deployment

### 1. Environment Variables
Netlify Dashboard > Site Settings > Environment Variables:
```
NEXT_PUBLIC_SITE_URL=https://studyflowers.netlify.app
```

### 2. Google Cloud Console
**Authorized redirect URIs:**
- `https://studyflowers.netlify.app/api/auth/callback`

### 3. Supabase Dashboard
**Site URL:** `https://studyflowers.netlify.app`
**Redirect URLs:** `https://studyflowers.netlify.app/api/auth/callback`

## Test
1. Deploy to Netlify
2. Go to auth page
3. Click \"Google ile devam et\"
4. Should redirect to main site after login