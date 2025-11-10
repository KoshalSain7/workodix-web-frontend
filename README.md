# WorkFolio - HRMS Web Application

A comprehensive Human Resource Management Software (HRMS) built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

1. **Centralized Employee Database** – Stores all employee data for easy access and updates
2. **Employee Self-Service Portal** – Lets employees manage info, leave requests, pay slips themselves
3. **Recruiting & Onboarding** – Automates job posting, resume screening, hiring workflows, and training new hires
4. **Payroll & Compensation** – Manages salary processing, tax deductions, compliance automatically
5. **Time Tracking & Attendance** – Tracks hours worked, overtime, shifts, integrates with payroll
6. **Leave & Absence Management** – Streamlines requests, approvals, balances
7. **Performance Management** – Goal setting, reviews, feedback, and growth tracking
8. **Learning & Development** – Employee training and skill progress monitoring
9. **Benefits Administration** – Manages health plans, insurance, other perks seamlessly
10. **Employee Engagement & Analytics** – Measures satisfaction, insights for smarter HR decisions
11. **Compliance Management** – Ensures labor law adherence and alerts for changes
12. **Mobile Access & Notifications** – Manage HR tasks anywhere with real-time alerts

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom components built with Tailwind CSS
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard/Home page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── profile/           # Profile pages
│   ├── request/           # Request pages (leave, attendance, etc.)
│   ├── attendance/        # Attendance pages
│   ├── payslip/           # Payslip pages
│   └── ...
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components (Header, Sidebar)
├── stores/                # Zustand state management stores
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions
```

## Key Pages

- **Dashboard** (`/`) - Main dashboard with calendar, feed, highlights
- **Social Profile** (`/profile/social`) - Employee social profile with education, hobbies
- **Attendance** (`/attendance`) - Attendance tracking and calendar
- **Leave Balance** (`/leave-balance`) - View leave balances
- **Leave Request** (`/request/leave`) - Apply for leave
- **Attendance Regularization** (`/request/attendance-regularization`) - Request attendance regularization
- **Payslip** (`/payslip`) - View and download payslips
- **Inbox** (`/inbox`) - View pending tasks and notifications

## State Management

The application uses Zustand for state management with the following stores:

- `authStore` - Authentication and user data
- `employeeStore` - Employee profile and information
- `attendanceStore` - Attendance and leave requests
- `dashboardStore` - Dashboard data (feed, celebrations, etc.)

## Building for Production

```bash
npm run build
npm start
```

## Development

The application is set up with:

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Next.js App Router for routing

## Customization

### Colors

**Edit `lib/theme.ts` to customize the color scheme.** This file is now the single source of truth for all colors in the application. The ThemeProvider component automatically injects these colors as CSS variables at runtime.

- All colors are defined in `lib/theme.ts`
- Change any color value in the `theme` object
- Changes automatically apply to all components using theme variables
- The primary color is set to black (`#000000`) by default, but can be easily changed

**Example:** To change the primary color from black to blue, edit `lib/theme.ts` and change:
```typescript
primary: "#000000"  // Change this
```
to:
```typescript
primary: "#2563eb"  // To this
```

### Adding New Features

1. Create new pages in the `app/` directory
2. Add new stores in `stores/` if needed
3. Create reusable components in `components/ui/`
4. Update navigation in `components/layout/Sidebar.tsx`

## License

This project is part of the WorkFolio HRMS application.
# workodix-web-frontend
