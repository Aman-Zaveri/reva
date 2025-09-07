# Database Setup Guide

This project now supports PostgreSQL database storage for your resume data. You can choose between localStorage (browser-only) and PostgreSQL (cloud database).

## Setup Options

### Option 1: Supabase (Recommended - Free)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Database Connection String**
   - In your Supabase dashboard, go to Settings → Database
   - Find the connection string under "Connection string"
   - It looks like: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

3. **Update Environment Variables**
   - Replace the `DATABASE_URL` in your `.env` file with your Supabase connection string
   - Make sure to replace `[password]` with your actual database password

4. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**
   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`

2. **Create Database**
   ```bash
   createdb resume_manager
   ```

3. **Update Environment Variables**
   - Update `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/resume_manager?schema=public"
   ```

4. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

### Option 3: Other Cloud Providers

You can also use:
- **Neon** (neon.tech) - Free tier available
- **Railway** (railway.app) - Free tier available
- **PlanetScale** (planetscale.com) - Free tier available

## How to Use

1. **Start with localStorage (default)**
   - No setup required, works immediately
   - Data is stored only in your browser

2. **Migrate to PostgreSQL**
   - Set up database using one of the options above
   - Go to Data Manager → Storage tab
   - Click "Switch to Database"
   - Your data will be automatically migrated

3. **Switch back to localStorage**
   - Go to Data Manager → Storage tab
   - Click "Switch to Local"
   - Data will be copied back to browser storage

## Database Schema

The database includes these tables:
- `personal_info` - Personal information
- `experiences` - Work experiences
- `projects` - Project details
- `skills` - Skill categories
- `education` - Education records
- `profiles` - Resume profiles
- Junction tables for many-to-many relationships with override support

## Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check if the database server is running
- Ensure network connectivity for cloud databases

### Migration Issues
- Make sure Prisma client is generated: `npx prisma generate`
- Try resetting migrations: `npx prisma migrate reset` (dev only)

### Type Issues
- Regenerate Prisma client: `npx prisma generate`
- Restart your development server
