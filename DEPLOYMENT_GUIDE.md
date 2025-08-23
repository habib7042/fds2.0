# Vercel Deployment Guide

## Environment Variables Setup

The error "Environment Variable 'NEXTAUTH_SECRET' references Secret 'nextauth_secret', which does not exist" occurs because your `vercel.json` file references environment variables that need to be set up in your Vercel project dashboard.

### Required Environment Variables

You need to set these environment variables in your Vercel project:

1. **`nextauth_secret`** - A secure random string for NextAuth
2. **`database_url`** - Your PostgreSQL database connection string
3. **`admin_username`** - Admin username for login
4. **`admin_password`** - Admin password for login

### How to Set Up Environment Variables in Vercel

1. **Go to your Vercel Dashboard**
   - Navigate to your project: https://vercel.com/habib7042/fds2-0

2. **Access Project Settings**
   - Click on your project name
   - Go to "Settings" tab
   - Select "Environment Variables" from the left menu

3. **Add Environment Variables**

   #### 1. NextAuth Secret
   - **Name**: `nextauth_secret`
   - **Value**: Generate a secure random string using:
     ```bash
     openssl rand -base64 32
     ```
   - **Environment**: Production, Preview, Development

   #### 2. Database URL
   - **Name**: `database_url`
   - **Value**: Your Neon.tech PostgreSQL connection string
     Format: `postgresql://username:password@host:port/database?sslmode=require`
   - **Environment**: Production, Preview, Development

   #### 3. Admin Username
   - **Name**: `admin_username`
   - **Value**: Your desired admin username (e.g., `admin`)
   - **Environment**: Production, Preview, Development

   #### 4. Admin Password
   - **Name**: `admin_password`
   - **Value**: Your desired admin password (e.g., `admin123`)
   - **Environment**: Production, Preview, Development

4. **Save and Redeploy**
   - Click "Save" after adding each variable
   - Go to the "Deployments" tab
   - Click "Redeploy" on the latest deployment

### Alternative: Update vercel.json

If you prefer to use environment variables directly without the `@` prefix, you can update your `vercel.json`:

```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/**/*.tsx": {
      "maxDuration": 30
    },
    "app/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXTAUTH_SECRET": "your-actual-secret-here",
    "DATABASE_URL": "your-actual-database-url-here",
    "ADMIN_USERNAME": "your-actual-admin-username-here",
    "ADMIN_PASSWORD": "your-actual-admin-password-here"
  }
}
```

However, the recommended approach is to use environment variables through the Vercel dashboard for security.

### Database Schema for Production

Before deploying to production, make sure to update your Prisma schema back to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

And run the migration on your Neon.tech database:

```sql
-- Create tables in your Neon.tech PostgreSQL database
CREATE TABLE "Admin" (
    "id" TEXT PRIMARY KEY DEFAULT 'cuid()'::text,
    "username" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Member" (
    "id" TEXT PRIMARY KEY DEFAULT 'cuid()'::text,
    "accountNumber" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Contribution" (
    "id" TEXT PRIMARY KEY DEFAULT 'cuid()'::text,
    "memberId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Contribution_memberId_month_year_key" ON "Contribution"("memberId", "month", "year");
```

### Local Development

For local development, use the `.env.local` file which is already configured with SQLite:

```env
# Database - Using SQLite for local development
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="JyqLDz5SkNI8RtPLfxluDF7cPU1EIqjmthRA3CLAzng="

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### Troubleshooting

If you still encounter issues:

1. **Check Environment Variables**: Ensure all variables are correctly set in Vercel
2. **Verify Database Connection**: Test your Neon.tech connection string
3. **Check Logs**: View deployment logs in Vercel for detailed error messages
4. **Redeploy**: Sometimes a simple redeploy fixes issues

### Success Criteria

Your deployment is successful when:
- All environment variables are properly set
- The database schema is created in Neon.tech
- The application builds without errors
- The admin login page works
- PDF generation works correctly

---

**Note**: For production use, make sure to:
- Use strong, unique passwords
- Keep your environment variables secure
- Regularly update your dependencies
- Monitor your application performance