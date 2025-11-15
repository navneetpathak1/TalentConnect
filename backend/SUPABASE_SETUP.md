# Supabase Storage Setup Guide

## Why Supabase Storage?

✅ **Easier Setup** - Just need project URL and service role key  
✅ **Built-in CDN** - Fast global delivery  
✅ **Simple API** - Cleaner than S3  
✅ **Free Tier** - 1GB storage, 2GB bandwidth/month  
✅ **Better DX** - Great documentation and tooling  

---

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: TalentConnect (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait ~2 minutes for project to be created

### Step 2: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Service Role Key** (starts with `eyJ...` - keep this secret!)

### Step 3: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Name: `talentconnect` (or your preferred name)
4. **Public bucket**: OFF (recommended for security)
5. **File size limit**: 10MB (or your preference)
6. **Allowed MIME types**: Leave empty for all types, or specify:
   - `application/pdf` (for resumes)
   - `image/*` (for logos, avatars)
   - `text/*` (for code submissions)

### Step 4: Set Up Bucket Policies (Optional but Recommended)

Go to **Storage** → **Policies** → **New Policy**

**Upload Policy** (for authenticated users):
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'talentconnect');
```

**Read Policy** (for authenticated users):
```sql
-- Allow authenticated users to read their files
CREATE POLICY "Users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'talentconnect');
```

### Step 5: Add to Backend `.env`

Add these to your `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=talentconnect
```

**Important Notes:**
- Use **Service Role Key**, NOT the anon key (for server-side operations)
- Keep the service role key secret - never commit it to Git
- The bucket name should match what you created in Step 3

---

## How It Works

1. **Frontend requests upload URL** → Backend generates Supabase signed URL
2. **Frontend uploads directly** → File goes to Supabase Storage (not through your server)
3. **Backend stores file path** → Save the key/path in your database
4. **Frontend requests file** → Backend generates signed download URL

---

## File Structure in Supabase

Files are organized by type:
```
talentconnect/
  ├── resume/
  │   ├── 1234567890-abc123.pdf
  │   └── 1234567891-def456.pdf
  ├── logo/
  │   └── 1234567892-ghi789.png
  ├── avatar/
  │   └── 1234567893-jkl012.jpg
  └── submission/
      └── 1234567894-mno345.zip
```

---

## Migration from S3

If you're currently using S3:

1. **Both can coexist** - The code automatically uses Supabase if configured, falls back to S3
2. **To switch**: Just add Supabase env vars (Supabase takes priority)
3. **To migrate files**: Use Supabase dashboard or migration script

---

## Testing

After setup, test the upload:

```bash
# Test from frontend
# 1. Try uploading a resume
# 2. Check Supabase Storage dashboard
# 3. Verify file appears in bucket
```

---

## Troubleshooting

### Error: "Supabase not configured"
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Make sure you're using the **Service Role Key**, not anon key

### Error: "Bucket not found"
- Verify bucket name matches `SUPABASE_BUCKET` in `.env`
- Check bucket exists in Supabase dashboard

### Error: "Permission denied"
- Check bucket policies are set up correctly
- Verify you're using Service Role Key (has admin access)

### Files not uploading
- Check file size limit in bucket settings
- Verify MIME type is allowed (if restrictions set)
- Check browser console for errors

---

## Security Best Practices

1. ✅ **Never expose Service Role Key** in frontend
2. ✅ **Use bucket policies** to restrict access
3. ✅ **Keep bucket private** (not public) for sensitive files
4. ✅ **Validate file types** on backend
5. ✅ **Set file size limits** in bucket settings
6. ✅ **Use signed URLs** (already implemented) for temporary access

---

## Cost

**Free Tier:**
- 1GB storage
- 2GB bandwidth/month
- Unlimited API requests

**Paid Plans:**
- Pro: $25/month - 100GB storage, 200GB bandwidth
- Team: $599/month - 500GB storage, 1TB bandwidth

For most projects, the free tier is sufficient to start!

---

## Support

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

**That's it! Your file uploads will now use Supabase Storage.** 🎉

