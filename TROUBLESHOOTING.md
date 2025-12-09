# Troubleshooting Guide

## Error: "Cannot read properties of null (reading 'useState')"

### Cause
This error occurs when the Vite dev server has cached an old version of React or when there's a module resolution issue.

### Solution

#### Option 1: Clear Vite Cache and Restart (Recommended)

```bash
# Stop the dev server (Ctrl+C)

# Clear Vite cache
rm -rf node_modules/.vite

# Restart the dev server
npm run dev
```

#### Option 2: Full Clean and Reinstall

```bash
# Stop the dev server (Ctrl+C)

# Clear all caches
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies (if needed)
pnpm install

# Restart the dev server
npm run dev
```

#### Option 3: Hard Refresh Browser

1. Stop the dev server
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart dev server
4. In browser, do a hard refresh:
   - **Chrome/Edge**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - **Firefox**: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
   - **Safari**: Cmd+Option+R

### Verification

After restarting, verify the application loads correctly:

1. Navigate to home page (`/`)
2. Click user icon in header
3. Should navigate to `/profile` without errors
4. Check browser console for any remaining errors

---

## Other Common Issues

### Issue: Profile Page Not Loading

**Symptoms**: Blank page or loading spinner that never completes

**Solution**:
1. Check if user is logged in
2. Verify Supabase connection
3. Check browser console for errors
4. Verify database migration was applied:
   ```sql
   SELECT * FROM communication_preferences LIMIT 1;
   ```

### Issue: Communication Preferences Not Saving

**Symptoms**: Changes don't persist after clicking "Save"

**Solution**:
1. Check browser console for errors
2. Verify user authentication:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```
3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'communication_preferences';
   ```

### Issue: Newsletter Subscription Fails

**Symptoms**: Error message when trying to subscribe

**Solution**:
1. Verify email format is valid
2. Check for duplicate email:
   ```sql
   SELECT * FROM newsletter_subscriptions WHERE email = 'test@example.com';
   ```
3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'newsletter_subscriptions';
   ```

### Issue: Emails Not Sending

**Symptoms**: No emails received after order creation

**Solution**:
1. Check Edge Function is deployed:
   ```
   Supabase Dashboard > Edge Functions > send_customer_communication
   ```
2. Verify RESEND_API_KEY is set:
   ```
   Supabase Dashboard > Settings > Edge Functions > Secrets
   ```
3. Check communication_logs:
   ```sql
   SELECT * FROM communication_logs 
   WHERE status = 'failed' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
4. Test Resend API directly:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "test@yourdomain.com",
       "to": "recipient@example.com",
       "subject": "Test",
       "html": "<p>Test</p>"
     }'
   ```

### Issue: TypeScript Errors

**Symptoms**: Red squiggly lines in IDE or build errors

**Solution**:
1. Run lint check:
   ```bash
   npm run lint
   ```
2. Check for type mismatches
3. Verify all imports are correct
4. Restart TypeScript server in IDE

### Issue: Build Fails

**Symptoms**: `npm run build` fails with errors

**Solution**:
1. Check lint errors:
   ```bash
   npm run lint
   ```
2. Fix any reported errors
3. Clear cache and rebuild:
   ```bash
   rm -rf dist
   rm -rf node_modules/.vite
   npm run build
   ```

---

## Debug Commands

### Check Database Connection

```typescript
// In browser console
const { data, error } = await supabase.from('profiles').select('count');
console.log('Database connection:', error ? 'Failed' : 'OK');
```

### Check User Authentication

```typescript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

### Check Communication Logs

```sql
-- In Supabase SQL Editor
SELECT 
  type,
  channel,
  status,
  COUNT(*) as count
FROM communication_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type, channel, status;
```

### Check Newsletter Subscriptions

```sql
-- In Supabase SQL Editor
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE is_active = false) as inactive
FROM newsletter_subscriptions;
```

---

## Performance Issues

### Issue: Slow Page Load

**Solution**:
1. Check network tab in browser DevTools
2. Optimize images
3. Enable caching
4. Use lazy loading for components

### Issue: Slow Database Queries

**Solution**:
1. Check query execution time:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM communication_logs WHERE user_id = 'xxx';
   ```
2. Verify indexes exist:
   ```sql
   SELECT indexname, tablename FROM pg_indexes 
   WHERE tablename = 'communication_logs';
   ```
3. Add missing indexes if needed

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review DEPLOYMENT_GUIDE.md
3. Check browser console for errors
4. Check Supabase logs
5. Verify all environment variables are set

### Information to Provide

When reporting an issue, include:

1. **Error message** (full text from console)
2. **Steps to reproduce** (what you did before the error)
3. **Environment** (browser, OS, Node version)
4. **Screenshots** (if applicable)
5. **Console logs** (from browser DevTools)
6. **Database logs** (from Supabase)

### Contact

- Email: support@srilayaenterprises.com
- Documentation: See repository docs

---

## Prevention Tips

### Best Practices

1. **Always clear cache** after major changes
2. **Restart dev server** after installing packages
3. **Hard refresh browser** after code changes
4. **Check console** for warnings and errors
5. **Test in incognito** to rule out browser cache issues
6. **Keep dependencies updated** (but test first)
7. **Use TypeScript** for type safety
8. **Write tests** for critical functionality

### Development Workflow

```bash
# 1. Make code changes
# 2. Save files
# 3. Check console for errors
# 4. Test in browser
# 5. If issues, clear cache:
rm -rf node_modules/.vite
# 6. Restart dev server
# 7. Hard refresh browser
```

---

## Quick Fixes Checklist

When something breaks, try these in order:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear Vite cache (`rm -rf node_modules/.vite`)
- [ ] Restart dev server
- [ ] Check browser console for errors
- [ ] Check Supabase logs
- [ ] Verify environment variables
- [ ] Run lint check (`npm run lint`)
- [ ] Clear browser cache
- [ ] Try incognito mode
- [ ] Reinstall dependencies (last resort)

---

**Last Updated**: 2025-11-26  
**Version**: 1.0.0
