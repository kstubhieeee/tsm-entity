# Database Setup & Usage Guide

## 🎯 All Hospital Operations Now Connected to MongoDB!

Your hospital management system is now fully integrated with MongoDB. All data is persistent and stored in your database.

## 📊 Database Collections

Your MongoDB database (`tsm-entity`) now has the following collections:

1. **`hospitals`** - Hospital user accounts
2. **`doctors`** - Doctor user accounts
3. **`patients`** - Patient user accounts
4. **`opd_queue`** - OPD patient queue
5. **`beds`** - Hospital bed tracking
6. **`admissions`** - Patient admissions
7. **`inventory`** - Stock and supplies

## 🚀 Getting Started

### Step 1: Start Your Application

```bash
npm run dev
```

Visit: http://localhost:3000

### Step 2: Initialize Sample Data (First Time Only)

When you first open the **Beds** or **Inventory** pages, if you see "No data found", click the **"Initialize"** button to populate sample data.

Or you can call the initialization endpoint directly:

```bash
curl -X POST http://localhost:3000/api/manage/init
```

This will create:
- **75 beds** across 6 departments
- **8 inventory items** with stock levels

## 📱 Using the Hospital Management System

### OPD Queue Management (`/manage/opd`)

**Add Patients:**
1. Click "Add Patient"
2. Fill in patient details
3. Submit → Patient is saved to MongoDB `opd_queue` collection

**Update Status:**
- Click "Start Consultation" → Updates status in database
- Click "Complete" → Updates status to completed

**Real-time Data:**
- All changes are immediately reflected in your MongoDB database
- Refresh the page to see persisted data

### Bed Management (`/manage/beds`)

**View Beds:**
- All beds are loaded from MongoDB `beds` collection
- Real-time occupancy tracking
- Color-coded availability (green = available, red = occupied)

**Automatic Updates:**
- When a patient is admitted, bed status is automatically updated to "occupied"
- When a patient is discharged, bed status changes to "available"

### Admissions (`/manage/admissions`)

**Create Admission:**
1. Click "New Admission"
2. Select department → Shows only available beds from that department
3. Fill patient details
4. Submit → Creates admission record AND updates bed status in database

**Discharge Patient:**
- Click "Discharge" → Updates admission status AND frees up the bed

**Data Persistence:**
- All admissions saved to `admissions` collection
- Bed assignments tracked in `beds` collection
- Complete audit trail maintained

### Inventory Management (`/manage/inventory`)

**View Stock Levels:**
- All inventory loaded from `inventory` collection
- Real-time stock tracking
- Low-stock alerts automatically calculated

**Restock Items:**
1. Click "Restock" on any item
2. Enter quantity
3. Confirm → Stock level updated in database

**Usage Tracking:**
- Usage history maintained in database
- Stock automatically decremented when used

## 🔍 Viewing Data in MongoDB

### Using MongoDB Compass:

1. Connect with your connection string:
   ```
   mongodb+srv://faizmoulavi11_db_user:b9Pd02xvvMoVjRzT@tsm-entity.s98nt7q.mongodb.net/
   ```

2. Select database: `tsm-entity`

3. View collections:
   - `opd_queue` - All OPD patients
   - `beds` - All hospital beds
   - `admissions` - All admission records
   - `inventory` - All inventory items

### Using MongoDB Atlas:

1. Log in to MongoDB Atlas
2. Browse Collections
3. Database: `tsm-entity`
4. View each collection

## 📊 Data Flow Example

### Example: Patient Admission Flow

1. **Add Patient to OPD:**
   - Data saved to `opd_queue` collection
   - Document includes: name, age, gender, department, priority, status

2. **Create Admission:**
   - New document in `admissions` collection
   - Linked bed document in `beds` collection updated (status: occupied)

3. **Discharge Patient:**
   - Admission document updated (status: discharged)
   - Bed document updated (status: available, patientId: removed)

**All operations are atomic and maintain data consistency!**

## 🛠️ API Endpoints Available

### OPD Queue
- `GET /api/manage/opd` - Fetch all patients
- `POST /api/manage/opd` - Add new patient
- `PATCH /api/manage/opd` - Update patient status
- `DELETE /api/manage/opd?id={patientId}` - Remove patient

### Beds
- `GET /api/manage/beds` - Fetch all beds
- `PATCH /api/manage/beds` - Update bed status

### Admissions
- `GET /api/manage/admissions` - Fetch all admissions
- `POST /api/manage/admissions` - Create admission
- `PATCH /api/manage/admissions` - Discharge patient

### Inventory
- `GET /api/manage/inventory` - Fetch all items
- `PATCH /api/manage/inventory` - Update stock (restock or use)

### Initialization
- `POST /api/manage/init` - Initialize beds and inventory with sample data

## ✅ What's Working Now

✅ **OPD Queue** - Fully database-connected
✅ **Bed Management** - Real-time tracking in MongoDB
✅ **Admissions** - Complete admission/discharge workflow
✅ **Inventory** - Stock management with history
✅ **Authentication** - All users stored in database
✅ **Data Persistence** - All operations saved to MongoDB

## 🎨 UI Features

- **Premium Black Theme** - Modern dark interface
- **Real-time Updates** - Changes reflected immediately
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Responsive Design** - Works on all devices

## 🔒 Data Security

- All passwords hashed with bcrypt
- JWT tokens for authentication
- HTTP-only cookies
- Protected API routes
- Role-based access control

## 📝 Testing the Integration

### Test OPD Queue:
1. Go to `/manage/opd`
2. Add a patient
3. Check MongoDB - new document in `opd_queue`
4. Update status
5. Check MongoDB - status field updated

### Test Bed Management:
1. Go to `/manage/beds`
2. If no data, click "Initialize Beds"
3. Check MongoDB - documents in `beds` collection
4. Create an admission
5. Check MongoDB - bed status changed to "occupied"

### Test Admissions:
1. Go to `/manage/admissions`
2. Create new admission (requires available bed)
3. Check MongoDB - new document in `admissions`
4. Check MongoDB `beds` - bed status updated
5. Discharge patient
6. Check MongoDB - both collections updated

### Test Inventory:
1. Go to `/manage/inventory`
2. If no data, click "Initialize Inventory"
3. Check MongoDB - documents in `inventory` collection
4. Restock an item
5. Check MongoDB - currentStock field updated

## 🚨 Troubleshooting

### "No data found" messages:
- Click the "Initialize" button on Beds or Inventory pages
- Or call: `POST /api/manage/init`

### Changes not reflecting:
- Check browser console for errors
- Verify MongoDB connection string in `.env.local`
- Ensure database name is `tsm-entity`

### Connection errors:
- Verify internet connectivity
- Check MongoDB Atlas whitelist settings
- Confirm connection string is correct

## 🎉 Success!

Your hospital management system is now fully database-enabled. All operations are persistent, data is secure, and everything is tracked in MongoDB in real-time!

**Next Steps:**
- Add more patients to OPD
- Create admissions
- Manage inventory
- Monitor everything in MongoDB

**Everything you do in the application is now permanently stored in your database!**
