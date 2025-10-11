# Admin Panel Dashboard - Project Documentation

## Overview
A comprehensive admin panel dashboard for company management built with a fullstack JavaScript architecture. The system provides robust HR/Payroll management, financial tracking, and inventory control with role-based authentication and extensive reporting capabilities.

## Project Goals
- Create a complete enterprise management system with Sales Invoices, Proforma Invoices, Customers, Expenses, Employees, Salaries, and Stock modules
- Implement role-based authentication with admin-managed access control
- Provide CSV/PDF export functionality for all data types
- Generate comprehensive audit reports
- Display visual insights through interactive dashboard graphs
- Ensure complete automated testing coverage with data-testid attributes

## Tech Stack
- **Frontend**: React with TypeScript, Wouter routing, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon-backed)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query v5)
- **Forms**: React Hook Form with Zod validation

## Project Architecture

### Current Implementation Status
✅ **Design System & UI Infrastructure** (Complete)
- Enterprise dark mode aesthetic (Linear/Stripe inspired)
- Comprehensive design guidelines in `design_guidelines.md`
- Reusable components: AppSidebar, DataTable, StatsCard, StatusBadge, ExportButton, ThemeToggle
- Complete data-testid attribute coverage for automated testing

✅ **HR Management Features** (Complete - Frontend Prototype)
- **Leave Management**: Leave requests, balance tracking, approval workflow
- **Attendance Tracking**: Daily attendance, work hours, overtime calculation
- **Performance Reviews**: Employee evaluations, rating system, review cycles
- **Employee Documents**: Document management with upload/download
- **Organization Chart**: Department structure, headcount visualization
- **Benefits Management**: Health insurance, retirement plans, life insurance tracking
- **Training & Certifications**: Course assignments, progress tracking, certification management
- **Exit Management**: Resignation handling, clearance checklist, final settlement

✅ **Payroll Features** (Complete - Frontend Prototype)
- **Salaries & Payroll**: Detailed salary breakdowns (base pay, allowances, insurance, tax deductions)
- **Payslip Generation**: Downloadable payslips with comprehensive earnings/deductions breakdown

✅ **Core Modules** (Pages Created)
- Dashboard with visual insights
- Sales Invoices
- Proforma Invoices
- Customers
- Expenses
- Employees
- Stock Management
- Audit Reports
- Permissions Management

### Data-testid Coverage
Complete automated testing coverage implemented across all modules:
- **Sidebar Navigation**: 6+ navigation items with unique data-testid attributes
- **HR Pages**: 50+ data-testid attributes across all HR features
  - Leave Management: 6 attributes
  - Attendance: 6 attributes  
  - Performance Reviews: 8 attributes
  - Employee Documents: 5 attributes
  - Organization Chart: 3 attributes
  - Benefits: 4 attributes
  - Training: 6 attributes
  - Exit Management: 7 attributes
  - Salaries: 7 attributes

### Architecture Decisions
1. **Separate Employee and Salary sections** maintained for better role-based access control and performance optimization (different workflows for HR vs. Accounting)
2. **Design-first approach**: Complete frontend prototype with mock data before backend implementation enables rapid iteration and user feedback
3. **Collapsible sidebar navigation**: Organized HR/Payroll features into logical groups for better UX
4. **Mock data approach**: Using `//todo: remove mock functionality` comments for easy cleanup during backend integration phase

## Recent Changes (Latest Session)
- **January 2024**: Added comprehensive HR features based on user feedback (Leave, Attendance, Performance, Documents, Org Chart, Benefits, Training, Exit Management)
- **January 2024**: Enhanced Salaries module with detailed breakdown and payslip generation
- **January 2024**: Implemented complete data-testid attribute coverage across all interactive elements and status badges
- **January 2024**: Organized sidebar navigation with collapsible sections for HR and Payroll features
- **January 2024**: Successfully validated all features with end-to-end Playwright testing

## User Preferences
- Enterprise aesthetic with dark mode support
- Clean, professional Linear/Stripe-inspired design
- Comprehensive HR/Payroll feature set for complete employee lifecycle management
- Data-driven insights with visual dashboards
- Export capabilities for compliance and reporting

## Development Guidelines
- Use mock data during prototype phase with clear `//todo:` comments
- Follow established design system in `design_guidelines.md`
- Maintain data-testid attributes on all interactive elements following pattern: `{type}-{description}-{id?}`
- Keep components reusable and maintain consistent spacing/styling
- Use Shadcn UI components as base, customize only when necessary

## Next Steps (Pending)
1. Backend API implementation for all modules
2. Database schema design and migration
3. Authentication & authorization system
4. Real data integration (replace mock data)
5. CSV/PDF export functionality implementation
6. Audit report generation system
7. Dashboard charts and analytics implementation
8. Production deployment and testing

## Important Files
- `client/src/App.tsx` - Main routing configuration
- `client/src/components/app-sidebar.tsx` - Navigation sidebar with collapsible sections
- `client/src/pages/dashboard.tsx` - Main dashboard
- `client/src/pages/salaries.tsx` - Salary management with detailed breakdowns
- `client/src/pages/leave-management.tsx` - Leave request management
- `client/src/components/data-table.tsx` - Reusable table component
- `shared/schema.ts` - Shared type definitions
- `server/routes.ts` - API route definitions
- `design_guidelines.md` - Design system documentation
