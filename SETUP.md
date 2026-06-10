# ⚡ Quick Start Guide - Expense Tracker

## Prerequisites Required

Before running the application, make sure you have:

1. **SQLite Database** - no external database server required
   - Default connection: `file:./dev.db`
   - `server/dev.db` will be generated automatically

2. **Node.js** - v16+ installed

## 🚀 Setup Instructions

### Step 1: Setup Backend Server

1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Important**: Set up the database
   - No external database is required; SQLite will create `server/dev.db`
   - Run migrations:
   ```bash
   npx prisma migrate dev
   ```
   - Seed sample data (optional):
   ```bash
   npx prisma db seed
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   Expense Tracker server is running on http://localhost:4000
   ```

### Step 2: Setup Frontend Client

1. **In a NEW terminal**, navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   Local:   http://localhost:5173/
   ```

4. Open http://localhost:5173 in your browser

## 🔧 Troubleshooting

### Issue: "Backend server is not responding"
- Make sure `npm run dev` is running in the `server` folder
- Verify the database connection in `server/.env`

### Issue: "Port already in use"
- If port 4000 (server) or 5173 (client) is already in use:
  - For server: Change `PORT` in `server/.env`
  - For client: The server will suggest an alternative port

### Issue: Database migration fails
- Ensure the local SQLite database file is accessible
- Check `DATABASE_URL` in `server/.env`
- Try: `npx prisma db push` instead of `prisma migrate dev`

### Issue: "Cannot find module" errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Default Test Credentials

After running `npx prisma db seed`:
- Email: `test@example.com`
- Password: `Test1234`

## 🔄 Windows Batch Files (Quick Start)

If you prefer not to use terminal commands:

1. **Start Backend**: Double-click `server/start-server.bat`
2. **Start Frontend**: Double-click `client/start-client.bat`

Both will handle installation, migrations, and startup automatically.

## ✅ Success Checklist

- [ ] Backend server running on http://localhost:4000
- [ ] Frontend running on http://localhost:5173 or the next available port
- [ ] Can see login page
- [ ] Can register new account or login
- [ ] Can access dashboard after successful login

