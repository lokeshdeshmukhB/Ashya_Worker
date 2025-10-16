# Quick Start Guide

## Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Configure Environment

The `.env` file is already configured with your MongoDB connection. You're ready to go!

### Step 3: Run the Application

```bash
# Run both server and client together
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

### Step 4: Create Your First Account

1. Open http://localhost:3000 in your browser
2. Click "Register"
3. Choose your role:
   - **Asha Worker**: For field workers collecting patient data
   - **Doctor**: For medical professionals providing diagnoses

### For Asha Workers:

**Sample Registration:**
- Name: Priya Sharma
- Email: priya@example.com
- Password: password123
- Phone: 9876543210
- Work Area: Rajpur Village
- Employee ID: ASH001

**After Registration:**
1. Click "Add New Patient Record"
2. Fill in patient details
3. Upload mouth images (use your phone camera or any image)
4. Assign to a doctor
5. Submit

### For Doctors:

**Sample Registration:**
- Name: Dr. Rajesh Kumar
- Email: rajesh@example.com
- Password: password123
- Phone: 9876543211
- Specialization: Oncology
- License Number: MED12345
- Hospital: District Hospital

**After Registration:**
1. View assigned patients on dashboard
2. Click "View Details" on any patient
3. Review patient information and images
4. Click "Create Diagnosis"
5. Fill in diagnosis details
6. Submit

### Real-time Features

- Asha workers get instant notifications when doctors complete diagnoses
- Doctors get notified when new patients are assigned
- Status updates are reflected immediately

### Troubleshooting

**Port already in use?**
```bash
# Change PORT in .env file
PORT=5001
```

**MongoDB connection issues?**
- Check your internet connection
- Verify MongoDB URI in .env file

**Client not starting?**
```bash
cd client
npm start
```

**Server not starting?**
```bash
npm run server
```

### Testing the System

1. **Create an Asha Worker account**
2. **Create a Doctor account** (use a different email)
3. **As Asha Worker**: Add a patient and assign to the doctor
4. **As Doctor**: Log in and diagnose the patient
5. **As Asha Worker**: Check for diagnosis notification

### Key Features to Test

- ✅ User registration and login
- ✅ Patient data collection with images
- ✅ Doctor assignment
- ✅ Diagnosis creation
- ✅ Real-time notifications
- ✅ Status tracking
- ✅ Patient details view
- ✅ Dashboard filtering

### Need Help?

Check the full README.md for detailed documentation.

---

**Happy Testing! 🎉**
