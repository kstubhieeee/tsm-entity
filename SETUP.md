# TSM Entity - Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://faizmoulavi11_db_user:b9Pd02xvvMoVjRzT@tsm-entity.s98nt7q.mongodb.net/?appName=TSM-Entity
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Structure

### Three Role-Based Portals

1. **Hospital Management** (`/manage/*`)
   - Dashboard with real-time metrics
   - OPD queue management
   - Bed allocation system
   - Patient admissions
   - Inventory tracking
   - Live operational metrics

2. **Doctor Portal** (`/doctor/*`)
   - Currently placeholder
   - Phase 2 will include appointments, AI assistance, etc.

3. **Patient Portal** (`/patient/*`)
   - Currently placeholder
   - Phase 2 will include booking, records, symptom checker, etc.

## Authentication Flow

### Sign Up
1. Go to `/auth/signup`
2. Select your role (Hospital/Doctor/Patient)
3. Fill the role-specific registration form
4. Submit to create account and auto-login

### Sign In
1. Go to `/auth/signin` (or just visit the root `/`)
2. Select your role
3. Enter email and password
4. Access your role-specific dashboard

## Database Collections

The application uses MongoDB with three separate collections:

- `hospitals` - Hospital management accounts
- `doctors` - Doctor accounts
- `patients` - Patient accounts

Each collection stores role-specific user data with proper validation.

## Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT-based authentication (7-day sessions)
- HTTP-only cookies
- Route protection middleware
- Role-based access control

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Testing Accounts

You can create test accounts for each role through the sign-up flow.

**Hospital Registration** requires:
- Hospital details (name, registration, type)
- Address information
- Bed capacity
- Admin information

**Doctor Registration** requires:
- Professional details (license, specialization)
- Experience and qualifications
- Contact information
- Consultation fee

**Patient Registration** requires:
- Personal information
- Contact details
- Emergency contact
- Address information
- Optional: Medical history, allergies, medications

## Color Scheme

- **Primary**: Blue (#2563eb) - Main brand color
- **Hospital**: Blue theme
- **Doctor**: Green theme
- **Patient**: Purple theme
- **Background**: Clean slate (#f8fafc)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcryptjs
- **Styling**: Tailwind CSS
- **State Management**: Zustand (for hospital operations)
- **Charts**: Recharts
- **Icons**: Lucide React

## Troubleshooting

### MongoDB Connection Issues
- Verify the `MONGODB_URI` in `.env.local`
- Check network connectivity
- Ensure IP address is whitelisted in MongoDB Atlas

### Authentication Not Working
- Clear browser cookies
- Verify `JWT_SECRET` is set in `.env.local`
- Check browser console for errors

### Build Errors
```bash
rm -rf .next
npm run build
```

## Next Phase Development

Phase 2 will focus on:
- Complete doctor portal features
- Complete patient portal features
- AI integration (RAG, Vision, Orchestration)
- Real-time notifications
- Advanced analytics
- Multi-hospital coordination

## Support

For issues or questions, refer to:
- `IMPLEMENTATION_SUMMARY.md` - Detailed technical documentation
- `ARCHITECTURE.md` - Original system architecture
