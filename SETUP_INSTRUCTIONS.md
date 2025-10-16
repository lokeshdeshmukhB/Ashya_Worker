# Complete Setup Instructions

## 🎯 Project Overview

**Oral Cancer Early Detection System** - A MERN stack application connecting Asha workers in rural areas with doctors for early oral cancer detection.

## 📋 What's Included

### Backend (Node.js + Express + MongoDB)
- ✅ User authentication with JWT
- ✅ Role-based access control (Doctor & Asha Worker)
- ✅ Patient management system
- ✅ Diagnosis creation and tracking
- ✅ Image upload functionality
- ✅ Real-time notifications with Socket.IO
- ✅ RESTful API endpoints

### Frontend (React + Tailwind CSS)
- ✅ Professional landing page
- ✅ User registration and login
- ✅ Doctor dashboard with patient management
- ✅ Asha worker dashboard with data collection
- ✅ Patient form with image upload
- ✅ Diagnosis form for doctors
- ✅ Real-time notifications
- ✅ Responsive, mobile-friendly design

## 🚀 Installation Steps

### 1. Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/
- Install LTS version (recommended)
- Verify installation: `node --version`

### 2. Install Dependencies

Open terminal in the project folder and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Your `.env` file is already configured with:
- MongoDB connection (MongoDB Atlas)
- JWT secret key
- Cloudinary credentials for image uploads
- Server port (5000)
- Client URL (http://localhost:3000)

**No additional configuration needed!**

### 4. Start the Application

**Option A: Run Everything Together (Recommended)**
```bash
npm run dev
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👥 User Roles & Workflows

### Asha Worker Workflow

1. **Register**
   - Go to http://localhost:3000/register
   - Select "Asha Worker"
   - Fill in details:
     - Name, Email, Password
     - Phone Number
     - Work Area (e.g., "Rajpur Village")
     - Employee ID (e.g., "ASH001")

2. **Add Patient**
   - Login to dashboard
   - Click "Add New Patient Record"
   - Fill patient information:
     - Personal details
     - Address
     - Medical history (tobacco use, alcohol)
     - Symptoms
     - Oral examination notes
   - Upload mouth images
   - Assign to a doctor
   - Set priority level
   - Submit

3. **Track Patients**
   - View all submitted patients
   - Filter by status
   - Receive notifications when diagnosed
   - View diagnosis results

### Doctor Workflow

1. **Register**
   - Go to http://localhost:3000/register
   - Select "Doctor"
   - Fill in credentials:
     - Name, Email, Password
     - Phone Number
     - Specialization (e.g., "Oncology")
     - License Number
     - Hospital Name

2. **Review Patients**
   - Login to dashboard
   - View assigned patients
   - Filter by status/priority
   - Click "View Details" to see full information
   - Review patient history and images

3. **Create Diagnosis**
   - Click "Diagnose" on patient
   - Select diagnosis result:
     - Negative
     - Suspicious
     - Positive
     - Requires Biopsy
   - Provide findings and recommendations
   - Add treatment plan
   - Schedule follow-up if needed
   - Add referral details if required
   - Submit diagnosis

## 🔧 Troubleshooting

### Port Already in Use

**Error**: "Port 5000 is already in use"

**Solution**: Change port in `.env`:
```env
PORT=5001
```

### MongoDB Connection Failed

**Error**: "MongoDB connection error"

**Solutions**:
1. Check internet connection
2. Verify MongoDB URI in `.env`
3. Ensure MongoDB Atlas IP whitelist includes your IP

### Cannot Find Module

**Error**: "Cannot find module 'xyz'"

**Solution**:
```bash
# Reinstall dependencies
npm install
cd client && npm install
```

### React App Won't Start

**Solution**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Images Not Uploading

**Check**:
1. `server/uploads` folder exists
2. File size < 5MB
3. File is an image format (jpg, png, etc.)

## 📱 Testing the Complete Flow

### Test Scenario: Complete Patient Journey

1. **Create Asha Worker Account**
   - Email: asha1@example.com
   - Password: password123

2. **Create Doctor Account**
   - Email: doctor1@example.com
   - Password: password123

3. **As Asha Worker**:
   - Add a test patient
   - Upload sample mouth images
   - Assign to the doctor you created
   - Set priority to "High"

4. **As Doctor**:
   - Login with doctor account
   - View the new patient (should see notification)
   - Click "View Details"
   - Review patient information
   - Click "Create Diagnosis"
   - Fill diagnosis form
   - Submit

5. **As Asha Worker**:
   - Check dashboard (should see notification)
   - View patient details
   - See the diagnosis result

## 🎨 UI Features

### Landing Page
- Professional hero section
- Feature highlights
- Statistics display
- Call-to-action buttons

### Dashboards
- Real-time statistics cards
- Patient list with filtering
- Status badges (color-coded)
- Priority indicators
- Quick action buttons

### Forms
- Step-by-step patient data collection
- Image upload with preview
- Symptom selection (common + custom)
- Doctor assignment dropdown
- Validation and error handling

### Patient Details
- Comprehensive information display
- Image gallery with zoom
- Diagnosis results (color-coded)
- Contact information
- Quick action buttons

## 📊 Database Collections

### Users
- Stores both Asha workers and doctors
- Role-based fields
- Authentication credentials

### Patients
- Patient demographics
- Medical history
- Symptoms
- Mouth images
- Status tracking

### Diagnoses
- Diagnosis results
- Findings and recommendations
- Treatment plans
- Follow-up scheduling
- Referral information

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ Secure file uploads
- ✅ CORS protection

## 📦 Project Structure

```
Asha_project/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/          # Auth & Socket context
│   │   ├── pages/            # All page components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                    # Express backend
│   ├── middleware/           # Authentication
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── uploads/             # Image storage
│   └── server.js
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── README.md                 # Full documentation
├── QUICKSTART.md            # Quick start guide
└── SETUP_INSTRUCTIONS.md    # This file
```

## 🌟 Key Features Implemented

### For Common Users (Patients)
- Easy-to-understand interface
- Clear diagnosis results
- Contact information readily available
- Follow-up scheduling

### For Asha Workers
- Simple patient data collection
- Mobile-friendly forms
- Image capture and upload
- Real-time status updates
- Dashboard with filtering

### For Doctors
- Comprehensive patient information
- High-quality image viewing
- Structured diagnosis forms
- Priority-based patient list
- Quick communication options

## 🎯 Next Steps After Setup

1. **Test all features** using the test scenario above
2. **Customize** the application as needed
3. **Add more doctors** to the system
4. **Train Asha workers** on using the interface
5. **Deploy** to production when ready

## 📞 Support

If you encounter any issues:
1. Check this documentation
2. Review error messages carefully
3. Check browser console for frontend errors
4. Check terminal for backend errors

## 🚀 Deployment (Future)

For production deployment, consider:
- Heroku or AWS for backend
- Netlify or Vercel for frontend
- MongoDB Atlas for database (already configured)
- Cloudinary for images (already configured)

---

**Your MERN stack oral cancer detection system is ready to use! 🎉**

Start the application with `npm run dev` and begin saving lives through early detection.
