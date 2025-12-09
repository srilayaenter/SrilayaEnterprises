# Srilaya Enterprises - Deployment Guide

## Overview

This guide covers the deployment and configuration of the Srilaya Enterprises Organic Store with the Customer Communication System.

## Prerequisites

- Supabase account and project
- Resend API account (for email sending)
- Node.js 18+ installed
- pnpm package manager

## Environment Variables

### Required Variables

Create or update `.env` file with the following variables:

```env
# Application
VITE_APP_ID=app-7tlhtx3qdxc1
VITE_LOGIN_TYPE=gmail

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# API Environment (optional)
VITE_API_ENV=production
```

### Supabase Edge Function Environment Variables

Configure these in your Supabase project settings:

```env
RESEND_API_KEY=re_your_resend_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Setup

### 1. Apply All Migrations

The following migrations have been applied:

- `00070_customer_communication_system.sql` - Customer communication tables, functions, and triggers

### 2. Verify Database Tables

Check that the following tables exist:

```sql
-- Communication tables
SELECT * FROM communication_preferences LIMIT 1;
SELECT * FROM communication_logs LIMIT 1;
SELECT * FROM newsletter_subscriptions LIMIT 1;
SELECT * FROM promotional_campaigns LIMIT 1;
```

### 3. Verify Database Functions

```sql
-- Test functions
SELECT upsert_communication_preferences(
  auth.uid(),
  'test@example.com',
  '+911234567890',
  true, true, true, true, true,
  false, false, false
);

SELECT subscribe_to_newsletter('test@example.com', auth.uid(), 'website');
```

### 4. Verify Triggers

```sql
-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_order_confirmation', 'trigger_order_status_notification');
```

## Edge Functions Deployment

### 1. Deploy send_customer_communication Function

The edge function has been deployed successfully:

```bash
# Function ID: 4c95f069-ae4b-4dbe-9767-b8870d2eb77a
# Status: ACTIVE
# Version: 1
```

### 2. Configure Resend API

1. Sign up at https://resend.com
2. Create an API key
3. Add the API key to Supabase Edge Function secrets:

```bash
# In Supabase Dashboard:
# Settings > Edge Functions > Secrets
# Add: RESEND_API_KEY=re_your_api_key
```

### 3. Test Edge Function

```bash
# Test the edge function
curl -X POST https://your-project.supabase.co/functions/v1/send_customer_communication \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 4. Set Up Cron Job (Optional)

To automatically process pending communications every 5 minutes:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job
SELECT cron.schedule(
  'process-communications',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send_customer_communication',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);

-- Verify the job
SELECT * FROM cron.job;
```

## Frontend Deployment

### 1. Install Dependencies

```bash
cd /workspace/app-7tlhtx3qdxc1
pnpm install
```

### 2. Build the Application

```bash
pnpm run build
```

### 3. Run Lint Check

```bash
pnpm run lint
```

### 4. Deploy to Hosting

Deploy the `dist` folder to your hosting provider:

- **Vercel**: Connect your GitHub repository and deploy
- **Netlify**: Drag and drop the `dist` folder
- **Cloudflare Pages**: Connect your repository
- **AWS S3 + CloudFront**: Upload the `dist` folder

## Email Configuration

### 1. Verify Domain (Optional but Recommended)

For production use, verify your domain in Resend:

1. Go to Resend Dashboard > Domains
2. Add your domain (e.g., srilayaenterprises.com)
3. Add the DNS records provided by Resend
4. Wait for verification

### 2. Update Email Templates

Update the "from" email address in the edge function:

```typescript
// In supabase/functions/send_customer_communication/index.ts
from: "Srilaya Enterprises <orders@yourdomain.com>",
```

### 3. Test Email Sending

1. Create a test order
2. Check communication_logs table for pending emails
3. Trigger the edge function manually or wait for cron job
4. Verify email delivery in Resend dashboard

## Testing Checklist

### Database Tests

- [ ] Communication preferences can be created and updated
- [ ] Newsletter subscriptions work
- [ ] Communication logs are created on order creation
- [ ] Triggers fire correctly on order status changes

### Email Tests

- [ ] Order confirmation email sent on order creation
- [ ] Shipping notification sent when order status changes to 'shipped'
- [ ] Delivery confirmation sent when order status changes to 'delivered'
- [ ] Newsletter subscription confirmation works
- [ ] Emails are delivered successfully

### UI Tests

- [ ] Profile page loads correctly
- [ ] Communication preferences can be updated
- [ ] Communication history displays correctly
- [ ] Newsletter subscription form works in footer
- [ ] User icon in header links to profile page

### Integration Tests

- [ ] Create a test order and verify email is sent
- [ ] Update order status and verify notifications
- [ ] Subscribe to newsletter and verify subscription
- [ ] Update communication preferences and verify changes

## Monitoring

### 1. Monitor Communication Logs

```sql
-- Check recent communications
SELECT 
  type,
  channel,
  status,
  COUNT(*) as count
FROM communication_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type, channel, status;

-- Check failed communications
SELECT *
FROM communication_logs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Monitor Email Delivery

Check Resend dashboard for:
- Delivery rates
- Bounce rates
- Open rates (if tracking enabled)
- Click rates (if tracking enabled)

### 3. Monitor Edge Function

Check Supabase Edge Function logs:
- Go to Supabase Dashboard > Edge Functions
- Select `send_customer_communication`
- View logs for errors and performance

## Troubleshooting

### Emails Not Sending

1. **Check Edge Function Logs**
   ```
   Supabase Dashboard > Edge Functions > send_customer_communication > Logs
   ```

2. **Verify Resend API Key**
   ```
   Supabase Dashboard > Settings > Edge Functions > Secrets
   ```

3. **Check Communication Logs**
   ```sql
   SELECT * FROM communication_logs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10;
   ```

4. **Test Resend API Directly**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "test@yourdomain.com",
       "to": "recipient@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

### Database Triggers Not Firing

1. **Check Trigger Exists**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'trigger_order_confirmation';
   ```

2. **Check Function Exists**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'trigger_send_order_confirmation';
   ```

3. **Test Trigger Manually**
   ```sql
   -- Create a test order and check communication_logs
   INSERT INTO orders (...) VALUES (...);
   SELECT * FROM communication_logs WHERE order_id = 'test_order_id';
   ```

### Communication Preferences Not Saving

1. **Check RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'communication_preferences';
   ```

2. **Verify User Authentication**
   ```sql
   SELECT auth.uid(); -- Should return user ID
   ```

3. **Check Function Permissions**
   ```sql
   SELECT has_function_privilege('upsert_communication_preferences', 'execute');
   ```

### Newsletter Subscription Not Working

1. **Check RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'newsletter_subscriptions';
   ```

2. **Test Function Directly**
   ```sql
   SELECT subscribe_to_newsletter('test@example.com', NULL, 'website');
   ```

3. **Check for Duplicate Emails**
   ```sql
   SELECT * FROM newsletter_subscriptions WHERE email = 'test@example.com';
   ```

## Performance Optimization

### 1. Database Indexes

Verify indexes exist:

```sql
SELECT indexname, tablename FROM pg_indexes 
WHERE tablename IN (
  'communication_preferences',
  'communication_logs',
  'newsletter_subscriptions',
  'promotional_campaigns'
);
```

### 2. Edge Function Optimization

- Process communications in batches (currently 10 per run)
- Implement retry logic for failed sends
- Use connection pooling for database queries

### 3. Email Template Optimization

- Minimize HTML size
- Use inline CSS
- Optimize images
- Test across email clients

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key kept secure
- [ ] Resend API key kept secure
- [ ] User data encrypted in transit
- [ ] Email addresses validated
- [ ] Unsubscribe functionality working
- [ ] Rate limiting implemented (if needed)
- [ ] CORS configured correctly

## Backup and Recovery

### 1. Database Backup

```sql
-- Backup communication data
COPY communication_preferences TO '/tmp/communication_preferences.csv' CSV HEADER;
COPY communication_logs TO '/tmp/communication_logs.csv' CSV HEADER;
COPY newsletter_subscriptions TO '/tmp/newsletter_subscriptions.csv' CSV HEADER;
```

### 2. Restore from Backup

```sql
-- Restore communication data
COPY communication_preferences FROM '/tmp/communication_preferences.csv' CSV HEADER;
COPY communication_logs FROM '/tmp/communication_logs.csv' CSV HEADER;
COPY newsletter_subscriptions FROM '/tmp/newsletter_subscriptions.csv' CSV HEADER;
```

## Maintenance Tasks

### Daily

- Monitor failed communications
- Check email delivery rates
- Review error logs

### Weekly

- Review communication statistics
- Check newsletter subscription growth
- Optimize email templates based on engagement

### Monthly

- Clean up old communication logs (optional)
- Review and update email templates
- Analyze user engagement metrics
- Update documentation

## Support and Documentation

### Internal Documentation

- `CUSTOMER_COMMUNICATION_SUMMARY.md` - Complete implementation details
- `CUSTOMER_COMMUNICATION_TODO.md` - Implementation checklist
- `README.md` - Project overview

### External Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Next Steps

1. **Configure Resend API** - Set up your Resend account and API key
2. **Test Email Sending** - Create test orders and verify emails
3. **Set Up Cron Job** - Automate communication processing
4. **Monitor Performance** - Track delivery rates and user engagement
5. **Optimize Templates** - Improve email templates based on feedback

## Contact

For technical support or questions:
- Email: support@srilayaenterprises.com
- Documentation: See internal docs in the repository

---

**Last Updated**: 2025-11-26  
**Version**: 1.0.0  
**Status**: PRODUCTION READY
