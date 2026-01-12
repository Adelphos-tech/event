# Supabase Setup Guide for EventsX

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: EventsX
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to your users (e.g., Singapore)
5. Click **"Create new project"**
6. Wait for project to be ready (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**For GitHub Actions (deployment):**
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Step 4: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the contents of `scripts/supabase-schema.sql`
4. Click **"Run"**
5. You should see "Setup Complete!" message

## Step 5: Verify Setup

Run the following query in SQL Editor to verify:

```sql
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Events:', COUNT(*) FROM events
UNION ALL
SELECT 'Attendees:', COUNT(*) FROM attendees;
```

Expected output:
```
Users:     1
Events:    1
Attendees: 0
```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to test.

## Step 8: Deploy

```bash
git add .
git commit -m "Switch to Supabase"
git push origin main
```

---

## Troubleshooting

### "Supabase configuration missing" error
- Make sure `.env` file has correct values
- Restart dev server after changing `.env`

### "relation does not exist" error
- Run the SQL schema in Supabase SQL Editor
- Make sure all tables are created

### Events not showing
- Check browser console for errors
- Verify Supabase URL and key are correct
- Check if events table has data in Supabase

---

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Password |
| role | VARCHAR(50) | user/owner/superadmin |
| contact | VARCHAR(100) | Phone number |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |

### Events Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| title | VARCHAR(500) | Event title |
| description | TEXT | Event description |
| start_date | DATE | Event start date |
| end_date | DATE | Event end date |
| venue | VARCHAR(500) | Event location |
| capacity | INTEGER | Max attendees |
| logo | TEXT | Logo image (base64) |
| image | TEXT | Event image (base64) |
| owner_id | BIGINT | FK to users |
| organisers | JSONB | Array of organisers |
| speakers | JSONB | Array of speakers |
| sponsors | JSONB | Array of sponsors |
| status | VARCHAR(50) | draft/active/cancelled/completed/deleted |

### Attendees Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| event_id | BIGINT | FK to events |
| name | VARCHAR(255) | Attendee name |
| email | VARCHAR(255) | Attendee email |
| contact | VARCHAR(100) | Phone number |
| notes | TEXT | Additional notes |
| attended | BOOLEAN | Check-in status |
| check_in_time | TIMESTAMPTZ | When checked in |

---

## Super Admin Login

After setup, you can log in with:
- **Email**: robocorpsg@gmail.com
- **Password**: Admin@7990
