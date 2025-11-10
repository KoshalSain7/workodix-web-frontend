# WorkFolio - Quick Start Guide

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**

   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Pages

### Main Pages

- **Dashboard** - `/` - Main dashboard with feed, calendar, and highlights
- **Inbox** - `/inbox` - View pending tasks
- **Attendance** - `/attendance` - Track attendance and view calendar
- **Leave Balance** - `/leave-balance` - View leave balances
- **Payslip** - `/payslip` - View and download payslips

### Profile Pages

- **Social Profile** - `/profile/social` - Employee social profile with education and hobbies

### Request Pages

- **Leave Request** - `/request/leave` - Apply for leave
- **Attendance Regularization** - `/request/attendance-regularization` - Request attendance regularization
- **On Duty** - `/request/on-duty` - Request on duty

## 🎨 Features Implemented

✅ Dashboard with feed, calendar, and highlights
✅ Employee social profile
✅ Attendance tracking and calendar
✅ Leave management (balance, requests)
✅ Attendance regularization
✅ Payslip viewing
✅ Employee self-service portal
✅ Responsive design
✅ State management with Zustand

## 🛠️ Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State Management)
- **Lucide React** (Icons)
- **date-fns** (Date utilities)

## 📁 Project Structure

```
frontend/
├── app/              # Pages (Next.js App Router)
├── components/        # React components
│   ├── ui/          # Reusable UI components
│   └── layout/      # Layout components
├── stores/           # Zustand state stores
├── types/           # TypeScript types
└── lib/             # Utility functions
```

## 🎯 Next Steps

To extend the application:

1. **Backend Integration**: Connect to your backend API
2. **Authentication**: Implement proper authentication flow
3. **Data Persistence**: Add database integration
4. **Additional Features**:
   - Performance management
   - Learning & development
   - Benefits administration
   - Analytics dashboard
   - Mobile responsiveness improvements

## 🔧 Customization

- **Colors**: Edit `app/globals.css` to change the color scheme
- **Navigation**: Update `components/layout/Sidebar.tsx` to add/remove menu items
- **State**: Add new stores in `stores/` directory
- **Components**: Create reusable components in `components/ui/`

## 📝 Notes

- The application uses mock data stored in Zustand stores
- All forms submit to the store (ready for backend integration)
- Calendar component supports attendance status visualization
- All pages are responsive and follow the design from the UI mockups
