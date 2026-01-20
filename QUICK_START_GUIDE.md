# 🚀 Quick Start Guide - TSM Entity

## ✅ Everything is Working!

Your development server is running successfully at:
```
http://localhost:3000
```

---

## 📝 First Time Setup

### 1. Initialize the Dashboard Data (Already Done!)
The gamification system has been initialized with demo data:
- ✅ 3 demo patients with leaderboard stats
- ✅ 24 daily tasks created
- ✅ Coins, levels, and streaks configured

---

## 🎯 How to Access the Portals

### **Sign In First**
Go to: `http://localhost:3000/auth/signin`

Choose your role:
- **Patient** - For patient portal
- **Doctor** - For medical professional portal
- **Hospital** - For hospital management

---

## 👤 **Patient Portal**

**Main Dashboard:**
```
http://localhost:3000/patient/dashboard
```

**Features Available:**
- 🎮 **Gamification Hub** - Complete tasks, earn coins, climb leaderboard
- 📅 **Appointments** - Book and manage appointments
- 💬 **Chat** - Patient communication
- 📊 **History** - View medical history
- 🔬 **Lab Analyzer** - Analyze lab reports
- 💊 **Medicine** - Manage medications
- 🩺 **Symptoms** - Symptom checker
- 📁 **Records** - Medical records
- 🆘 **Medi-Support** - Support system

**Other Pages:**
- `/patient/appointments` - Manage appointments
- `/patient/chat` - Chat interface
- `/patient/history` - Medical history
- `/patient/lab-analyzer` - Lab analysis
- `/patient/medicine` - Medicine management
- `/patient/symptoms` - Symptoms checker
- `/patient/records` - Records viewer
- `/patient/medi-support` - Support

---

## 👨‍⚕️ **Doctor Portal**

**Main Dashboard:**
```
http://localhost:3000/doctor/dashboard
```

**Features Available:**
- 🤖 **AI Orchestration** - Multi-agent AI diagnosis system
- 📊 **Analytics** - Medical analytics dashboard
- 🔍 **Diagnosis** - Diagnosis tools
- 👥 **Patients** - Patient management
- 👤 **Profile** - Doctor profile setup
- 📚 **Research** - Medical research portal

**Other Pages:**
- `/doctor/ai-orchestration` - AI diagnosis system
- `/doctor/analytics` - Analytics dashboard
- `/doctor/diagnosis` - Diagnosis interface
- `/doctor/patients` - Patient list
- `/doctor/profile-setup` - Setup profile
- `/doctor/research` - Research tools

---

## 🏥 **Hospital Management Portal**

**Main Dashboard:**
```
http://localhost:3000/manage/dashboard
```

**Features Available:**
- 📋 **OPD Queue** - Outpatient department management
- 🛏️ **Beds** - Bed management and allocation
- 🏥 **Admissions** - Patient admissions
- 📦 **Inventory** - Medical inventory
- 📊 **Metrics** - Hospital metrics

**Other Pages:**
- `/manage/opd` - OPD queue management
- `/manage/beds` - Bed management
- `/manage/admissions` - Admissions
- `/manage/inventory` - Inventory management
- `/manage/metrics` - Performance metrics

---

## 🔧 API Endpoints Working

### **Authentication**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/me` - Get current user

### **Dashboard (Gamification)**
- `GET /api/dashboard/coins` - Get user coins
- `GET /api/dashboard/daily-tasks` - Get daily tasks
- `GET /api/dashboard/leaderboard` - Get leaderboard
- `POST /api/dashboard/init` - Initialize demo data

### **Appointments**
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment

### **Doctors**
- `GET /api/doctors` - List doctors
- `GET /api/doctors/[id]` - Get doctor details
- `GET /api/doctors/appointments` - Doctor appointments
- `GET /api/doctors/profile` - Doctor profile

### **Payments**
- `GET /api/payment/history` - Payment history
- `POST /api/payment/create-order` - Create payment

### **Diagnosis**
- `GET /api/diagnosis/history` - Diagnosis history
- `POST /api/diagnosis/save` - Save diagnosis

---

## 🎨 Design Features

### **Color Scheme**
- Background: `#FFFFF4` (Cream)
- Accent: `#D6F32F` (Lime Green)
- Text: `#151616` (Black)
- Style: Neobrutalism with thick borders and shadows

### **Animations**
- Framer Motion for smooth transitions
- Coin animations on task completion
- Hover effects on cards
- Loading states

---

## 📊 Database Structure

### **Collections**
- `hospitals` - Hospital user accounts
- `doctors` - Doctor user accounts  
- `patients` - Patient user accounts (with gamification data)
- `beds` - Hospital bed management
- `admissions` - Patient admissions
- `inventory` - Medical inventory
- `appointments` - Appointment bookings
- `tasks` - Daily health tasks
- `cointransactions` - Coin transaction history
- `payments` - Payment records
- `diagnosishistories` - Diagnosis records

---

## 🎮 Using the Gamification System

### **For Patients:**
1. Sign in as a patient
2. Go to `/patient/dashboard`
3. View daily tasks
4. Complete tasks to earn coins
5. Check your position on the leaderboard
6. Track your streak and level up!

### **Task Categories:**
- 🏃 **Fitness** - Requires video verification
- 🥗 **Nutrition** - Direct completion
- 🧘 **Wellness** - Requires video verification
- 💊 **Medical** - Direct completion

---

## 🔐 Authentication Flow

1. **Sign Up**: Choose role → Fill form → Create account
2. **Sign In**: Enter email & password → Redirected to role-specific dashboard
3. **Protected Routes**: Middleware checks JWT token → Redirects if not authenticated

---

## 💡 Tips

### **Testing the System**
- Use the demo patient accounts from initialization
- Create your own patient/doctor accounts
- Try completing tasks to see coin animations
- Book appointments between doctors and patients

### **Database Viewing**
- Use MongoDB Compass
- Connection string from your `.env.local`
- Database name: `tsm-entity` (or as configured)

---

## 🐛 Troubleshooting

### **If dashboard shows no tasks:**
Run initialization:
```bash
curl -X POST http://localhost:3000/api/dashboard/init
```

### **If authentication doesn't work:**
Check `.env.local` has:
```
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret_key
```

### **If pages don't load:**
1. Clear `.next` folder: `rm -rf .next`
2. Restart dev server: `npm run dev`

---

## 📚 Documentation Files

- `FINAL_INTEGRATION_REPORT.md` - Complete integration details
- `INTEGRATION_STATUS.md` - Technical status
- `DATABASE_INTEGRATION_SUMMARY.md` - Database info
- `ARCHITECTURE.md` - Project architecture

---

## ✨ You're All Set!

Everything is configured and ready to use. Explore the three portals:

1. **Patient Portal** - Gamified health management
2. **Doctor Portal** - AI-powered medical tools
3. **Hospital Portal** - Operational management

**Enjoy your TSM Entity platform!** 🎉
