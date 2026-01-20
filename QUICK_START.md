# 🚀 Quick Start Guide

## Getting Your Hospital System Running

### 1. Start the Application

```bash
npm run dev
```

Visit: **http://localhost:3000**

### 2. Sign Up (First Time)

1. Click **"Sign up"**
2. Choose **"Hospital Management"** role
3. Fill in your hospital details
4. Submit → You'll be logged in automatically

### 3. Initialize Your Database

**First time setup - do this once:**

Navigate to `/manage/beds` or `/manage/inventory`

Click the **"Initialize"** button you'll see on the page

This creates:
- ✅ 75 hospital beds across 6 departments
- ✅ 8 inventory items with stock levels

### 4. Start Using the System

#### Add Your First Patient
1. Go to **OPD Queue** (`/manage/opd`)
2. Click **"Add Patient"**
3. Fill details and submit
4. ✅ Patient saved to MongoDB!

#### Check Bed Availability
1. Go to **Bed Management** (`/manage/beds`)
2. View all beds by department
3. Green = Available, Red = Occupied

#### Create an Admission
1. Go to **Admissions** (`/manage/admissions`)
2. Click **"New Admission"**
3. Select department and available bed
4. Fill patient details
5. Submit → ✅ Admission created & bed marked occupied!

#### Manage Inventory
1. Go to **Inventory** (`/manage/inventory`)
2. View all medical supplies
3. Click **"Restock"** to add more stock
4. ✅ Changes saved to database!

### 5. View Your Data in MongoDB

**Option 1: MongoDB Compass**
- Connection string: (check your `.env.local`)
- Database: `tsm-entity`
- Collections: `opd_queue`, `beds`, `admissions`, `inventory`

**Option 2: MongoDB Atlas**
- Log in to your Atlas account
- Browse Collections
- See all your data in real-time!

## 🎨 Premium Features

✨ **Dark Theme** - Sleek black design throughout
🔄 **Real-time Updates** - All changes instant
💾 **Database Persistence** - Everything saved automatically
📊 **Live Charts** - Visual data insights
🔒 **Secure Auth** - JWT-based authentication

## 📱 Main Pages

- **Dashboard** (`/manage/dashboard`) - Overview & metrics
- **OPD Queue** (`/manage/opd`) - Patient queue management
- **Beds** (`/manage/beds`) - Bed availability tracking
- **Admissions** (`/manage/admissions`) - Patient admissions
- **Inventory** (`/manage/inventory`) - Stock management
- **Metrics** (`/manage/metrics`) - Live analytics

## 💡 Tips

- 🔵 All data is saved to MongoDB automatically
- 🟢 Green badges/colors = good status
- 🟡 Yellow/Amber = warnings or low stock
- 🔴 Red = critical or occupied
- ⚡ Click "Refresh" if you don't see updates immediately

## 🆘 Need Help?

Check `DATABASE_SETUP.md` for detailed documentation!

---

**You're all set! Start managing your hospital operations now! 🏥**
