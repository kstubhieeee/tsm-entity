# TSM Entity - Healthcare Management Platform

A comprehensive healthcare management platform with role-based portals for hospitals, doctors, and patients.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd tsm-entity
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?appName=TSM-Entity
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tsm-entity/
├── app/
│   ├── auth/              # Authentication pages
│   ├── manage/            # Hospital management portal
│   ├── doctor/            # Doctor portal
│   ├── patient/           # Patient portal
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── mongodb.ts         # Database connection
│   ├── auth.ts            # Authentication utilities
│   ├── models.ts          # Database models
│   └── store.ts           # State management
└── middleware.ts          # Route protection
```

## 🎯 Features

### Phase 1 (Current) - Hospital Management ✅

#### Complete Hospital Operations
- **Dashboard**: Real-time operational metrics and analytics
- **OPD Queue**: Patient check-in and queue management
- **Bed Management**: Track bed availability across departments
- **Admissions**: Patient admission and discharge workflows
- **Inventory**: Stock management with low-stock alerts
- **Live Metrics**: System-wide health monitoring

#### Authentication System
- Email/password authentication
- Role-based access control (Hospital/Doctor/Patient)
- Secure JWT sessions
- Protected routes with middleware
- Comprehensive registration forms

#### Database Integration
- MongoDB Atlas connection
- Three separate collections for role segregation
- Persistent data storage
- Secure password hashing

### Phase 2 (Planned) - Doctor & Patient Portals

#### Doctor Portal
- Patient appointment scheduling
- AI-powered diagnosis assistance
- Electronic prescription system
- Patient health records management
- Medical imaging analysis

#### Patient Portal
- Book doctor appointments
- View medical records and history
- AI-powered symptom checker
- Prescription management
- Health tracking and analytics

## 🔐 Authentication

### Three Role Types

1. **Hospital Management**
   - Access to operational command center
   - Manage beds, admissions, inventory
   - View system-wide metrics

2. **Doctor**
   - Patient management (Phase 2)
   - Medical tools and AI assistance (Phase 2)
   - Prescription writing (Phase 2)

3. **Patient**
   - Appointment booking (Phase 2)
   - Health records access (Phase 2)
   - Personal health tracking (Phase 2)

### How It Works

1. Visit `/auth/signup` to create an account
2. Select your role (Hospital/Doctor/Patient)
3. Fill in the role-specific registration form
4. Get redirected to your role-specific dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcryptjs
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Custom component library

## 📊 Database Schema

### Collections

1. **hospitals** - Hospital management accounts
   - Hospital information
   - Bed capacity
   - Admin details
   - Contact information

2. **doctors** - Doctor accounts
   - Professional credentials
   - Specialization
   - Availability
   - Consultation fees

3. **patients** - Patient accounts
   - Personal information
   - Medical history
   - Emergency contacts
   - Health records

## 🎨 Design System

- **Primary Color**: Blue (#2563eb) - Professional healthcare
- **Hospital Theme**: Blue tones
- **Doctor Theme**: Green tones
- **Patient Theme**: Purple tones
- **Typography**: Poppins (sans-serif) + Instrument Serif (headings)
- **Layout**: Clean, modern, mobile-responsive

## 🔒 Security

- Password hashing with bcryptjs (12 salt rounds)
- JWT tokens with 7-day expiration
- HTTP-only secure cookies
- Protected API routes
- Role-based middleware
- Input validation and sanitization

## 📝 Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🗂️ Key Files

- `middleware.ts` - Route protection and role-based access
- `lib/mongodb.ts` - Database connection handler
- `lib/auth.ts` - JWT and password utilities
- `lib/models.ts` - TypeScript interfaces
- `app/api/auth/*` - Authentication endpoints

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Original system architecture

## 🚧 Development Status

### ✅ Completed (Phase 1)
- MongoDB integration
- Authentication system
- Hospital management portal
- Route restructuring
- UI/UX improvements
- Security implementation

### 🔄 In Progress (Phase 2)
- Doctor portal features
- Patient portal features
- AI integrations
- Real-time notifications

### 📋 Planned (Future Phases)
- Multi-hospital network
- City-wide health coordination
- Advanced analytics
- Gamification
- Mobile apps

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify `MONGODB_URI` in `.env.local`
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### Authentication Issues
- Clear browser cookies
- Verify `JWT_SECRET` is set
- Check console for errors

### Build Errors
```bash
rm -rf .next
npm install
npm run build
```

## 🤝 Contributing

This project follows a config-based architecture. When contributing:
- Use TypeScript for type safety
- Follow the existing code structure
- Write clean, readable code
- Test authentication flows
- Update documentation

## 📄 License

[Add your license here]

## 👥 Team

TSM Entity Development Team

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Current Version**: 1.0.0 (Phase 1 Complete)
**Last Updated**: January 2026
