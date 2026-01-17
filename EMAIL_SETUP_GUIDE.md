# Resend Email Setup Guide for LinkMeU

Email notifications are configured using **Resend** API.

## Current Configuration

| Setting | Value |
|---------|-------|
| **API Key** | `re_XsUfMJhc_L95CUZDQyb7yrQA53CvQwku3` |
| **Admin Email** | `linkmeucom@gmail.com` |
| **From Email** | `LinkMeU <onboarding@resend.dev>` |

## Email Flow

### 1. New Listing Submitted
```
User submits listing → notifyAdminNewListing() → Resend API
                                                      ↓
                                          📧 Email to linkmeucom@gmail.com
                                          Subject: "🆕 New Listing Pending Approval: [Title]"
```

### 2. Listing Approved
```
Admin approves → notifyUserListingStatus() → Resend API
                                                  ↓
                                      📧 Email to user
                                      Subject: "🎉 Your Listing is Now Live!"
```

### 3. Listing Rejected
```
Admin rejects → notifyUserListingStatus() → Resend API
                                                 ↓
                                     📧 Email to user
                                     Subject: "❌ Listing Not Approved"
```

## Important: Resend Limitations

### Testing Mode (Current)
With `onboarding@resend.dev` as the from address:
- ✅ Can send to **any email** for testing
- ⚠️ Emails may go to spam
- ⚠️ Limited to 100 emails/day

### Production Mode (Recommended)
To send from your own domain:

1. **Add your domain in Resend Dashboard**
   - Go to https://resend.com/domains
   - Add `linkmeu.com` (or your domain)
   - Add the DNS records they provide

2. **Update the FROM_EMAIL in code**
   ```javascript
   // In /src/utils/emailService.js, line 10:
   const FROM_EMAIL = 'LinkMeU <notifications@linkmeu.com>';
   ```

3. **Benefits of verified domain:**
   - ✅ Better deliverability
   - ✅ No spam folder issues
   - ✅ Professional appearance
   - ✅ Higher sending limits

## File Location

All email logic is in:
```
/src/utils/emailService.js
```

## Email Templates

Templates are embedded in the code with beautiful HTML styling:

### Admin Notification Email
- Red gradient header
- Listing details card
- "Review in Admin Panel" button
- Professional footer

### User Status Email
- Green header (approved) / Red header (rejected)
- Status badge
- Message explaining the status
- Support contact info
- Link to view listing (if approved)

## Testing

1. Submit a test listing at `/register-listing`
2. Check `linkmeucom@gmail.com` for admin notification
3. Go to `/listings-admin` and approve the listing
4. Check the user's email for approval notification

## Troubleshooting

### Emails not sending?
- Check browser console for errors
- Verify API key is correct
- Check Resend dashboard for logs: https://resend.com/emails

### Emails going to spam?
- Add a verified domain (see Production Mode above)
- Ask recipients to mark as "Not Spam"

### API errors?
- Check Resend status: https://status.resend.com
- Verify you haven't exceeded rate limits

## Resend Dashboard

- **Emails sent:** https://resend.com/emails
- **API Keys:** https://resend.com/api-keys
- **Domains:** https://resend.com/domains
- **Usage:** https://resend.com/usage

## Pricing

| Plan | Emails/month | Price |
|------|--------------|-------|
| Free | 3,000 | $0 |
| Pro | 50,000 | $20/mo |
| Enterprise | Unlimited | Custom |

---

**Note:** The API key is stored in the frontend code. For better security in production, consider:
1. Moving email sending to a backend/serverless function
2. Using environment variables
3. Implementing rate limiting
