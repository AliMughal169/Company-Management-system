# Admin Panel Dashboard Design Guidelines

## Design Approach
**Selected Approach**: Design System with Modern Enterprise Aesthetic
- **Primary Inspiration**: Linear's clean minimalism + Stripe Dashboard's data professionalism
- **Rationale**: Enterprise admin panels require consistency, clarity, and efficiency over visual flair
- **Principles**: Data clarity, intuitive navigation, consistent patterns, purposeful interactions

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: 222 47% 11% (deep charcoal)
- Surface: 222 47% 15% (elevated panels)
- Surface Elevated: 222 47% 18% (modals, dropdowns)
- Border: 217 33% 25% (subtle divisions)
- Text Primary: 210 40% 98%
- Text Secondary: 215 20% 65%
- Text Muted: 215 16% 47%

**Brand Colors**
- Primary: 217 91% 60% (vibrant blue for CTAs, active states)
- Primary Hover: 217 91% 55%
- Success: 142 76% 36% (confirmations, positive metrics)
- Warning: 38 92% 50% (alerts, pending states)
- Danger: 0 84% 60% (destructive actions, critical alerts)
- Info: 199 89% 48% (informational badges)

**Chart & Data Visualization**
- Chart 1: 217 91% 60% (primary blue)
- Chart 2: 142 76% 45% (emerald)
- Chart 3: 271 91% 65% (purple)
- Chart 4: 38 92% 50% (amber)
- Chart 5: 340 82% 52% (rose)

### B. Typography

**Font Families**
- Primary: 'Inter' (system UI, clean readability)
- Monospace: 'JetBrains Mono' (for invoice numbers, IDs, data codes)

**Type Scale**
- Display: 2.5rem / 600 weight (dashboard headings)
- H1: 1.875rem / 600 weight (page titles)
- H2: 1.5rem / 600 weight (section headers)
- H3: 1.25rem / 600 weight (card titles)
- Body Large: 1rem / 400 weight (primary content)
- Body: 0.875rem / 400 weight (table data, descriptions)
- Small: 0.75rem / 400 weight (labels, metadata)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16 consistently
- Component padding: p-6 (cards), p-4 (tight spaces)
- Section spacing: space-y-8 (vertical stacks)
- Grid gaps: gap-6 (card grids), gap-4 (form elements)
- Page padding: px-8 py-6 (main content area)

**Grid Structure**
- Dashboard: 12-column responsive grid
- Sidebar: Fixed 16rem width on desktop, collapsible on mobile
- Main Content: Fluid with max-w-7xl container
- Cards: Grid layout with min-w-64 for responsive columns

### D. Component Library

**Navigation**
- Sidebar: Fixed left navigation with icon + label, collapsible sections for modules
- Top Bar: Breadcrumbs, search, notifications, user profile dropdown
- Module Navigation: Tabs for sub-sections (e.g., Sales Invoices → Paid/Pending/Overdue)

**Data Display**
- Tables: Striped rows, sticky headers, sortable columns, row hover states (bg-surface-elevated)
- Cards: Rounded-lg, border-border, shadow-sm, p-6 with header/body/footer structure
- Stats Cards: Large metric display with trend indicators (↑↓) and sparkline charts
- Charts: Use Recharts library with consistent color mapping, responsive sizing

**Forms**
- Input Fields: Border-border, focus:ring-2 ring-primary, rounded-md
- Select Dropdowns: Custom styled with chevron icon, searchable for long lists
- Date Pickers: Calendar overlay with range selection for reports
- File Upload: Drag-drop zone with preview for CSV/PDF uploads

**Action Elements**
- Primary Buttons: bg-primary text-white, px-4 py-2, rounded-md, font-medium
- Secondary Buttons: border-border text-secondary, bg-transparent
- Icon Buttons: p-2, hover:bg-surface-elevated, rounded-md (for table actions)
- Floating Action Button: Fixed bottom-right for quick invoice creation (on relevant pages)

**Data Visualization**
- Dashboard Charts: Mix of Line (revenue trends), Bar (expense categories), Pie (stock distribution), Area (cumulative metrics)
- Insight Cards: 3-4 column grid showing KPIs with comparison to previous period
- Mini Charts: Sparklines in table rows showing historical trends

**Modals & Overlays**
- Modals: Center-screen, max-w-2xl, backdrop-blur-sm backdrop
- Slide-overs: Right-side panel (w-96) for quick edits/previews
- Toasts: Top-right notifications with auto-dismiss
- Confirmation Dialogs: Compact, action-focused with clear primary/cancel buttons

### E. Module-Specific Patterns

**Invoice Management**
- List View: Table with status badges (Paid: success, Pending: warning, Overdue: danger)
- Detail View: Professional invoice layout with company header, line items table, totals breakdown
- Actions Bar: Export (CSV/PDF), Print, Send Email, Mark as Paid buttons

**Dashboard Insights**
- Top Section: 4 KPI cards (Total Revenue, Outstanding Invoices, Stock Value, Active Employees)
- Chart Section: 2-column layout → Revenue trend (line) + Expense breakdown (donut)
- Bottom Section: Recent activities table + Top customers list (2-column)

**Role-Based UI**
- Permission Badges: Small colored badges showing user role in top bar
- Conditional Display: Gray out/hide unauthorized actions seamlessly
- Admin Panel: Dedicated permissions matrix table with toggle switches

**Export & Reports**
- Export Button: Icon + "Export" label with dropdown (CSV, PDF, Excel options)
- Audit Report: Date range picker + filter panel + generated table with download option
- PDF Preview: Modal showing formatted document before download

## Images

**No Hero Images Required** - This is a data-focused admin application

**Functional Images**:
- Empty States: Simple illustrations for "No invoices yet", "No stock items" (use undraw.co style)
- User Avatars: Circular avatars in employee/user listings with initials fallback
- Product Images: Thumbnail images in stock management (64x64px, rounded)
- Company Logo: Top-left corner of sidebar (max height 40px)

**Icon Strategy**: Use Lucide Icons consistently throughout (modern, outlined style matching Linear)

## Interaction Patterns

- Table row click: Navigate to detail view
- Hover states: Subtle bg-surface-elevated transitions
- Loading states: Skeleton loaders matching content structure
- Optimistic updates: Instant feedback with background sync
- Search: Debounced input with live filtering (300ms delay)
- Bulk actions: Checkbox selection with floating action bar

## Accessibility & Performance

- Dark mode optimized for reduced eye strain during extended use
- Focus indicators: 2px ring-primary outline
- Keyboard navigation: Full support with visible focus states
- Color blindness: Use icons + text labels alongside color coding
- Table pagination: Show 25/50/100 rows options with total count
- Lazy loading: Charts and large tables load on viewport intersection