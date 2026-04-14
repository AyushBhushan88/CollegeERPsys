# Frontend Requirements
# College ERP System — Modern Minimalist UI

---

| Field       | Value                     |
|-------------|---------------------------|
| **Version** | 1.0                      |
| **Date**    | 2026-04-14                |
| **Style**   | Modern Minimalist         |
| **Ref**     | PRD v1.0 · SRS v1.0      |

---

## 1. Design Philosophy

> **"Reduce to the essence. Every pixel earns its place."**

| Principle              | Implementation                                                    |
|------------------------|-------------------------------------------------------------------|
| **Whitespace-first**   | Generous padding/margins. Content breathes. No visual clutter.    |
| **Purposeful color**   | Monochrome base + single accent color. Color = meaning.           |
| **Typography-driven**  | Type hierarchy carries the UI — not borders, boxes, or icons.     |
| **Progressive reveal** | Show only what's needed now. Collapse, defer, or paginate the rest.|
| **Micro-interactions** | Subtle transitions (150–300ms) for state changes. No jarring shifts.|
| **Mobile-first**       | Design for 360px first, scale up to 1920px.                       |

---

## 2. Design Tokens

### 2.1 Color System

```
──── Neutrals ───────────────────────────
--bg-primary:        #FAFAFA       (light mode canvas)
--bg-secondary:      #FFFFFF       (cards, surfaces)
--bg-dark:           #0F0F0F       (dark mode canvas)
--bg-dark-surface:   #1A1A1A       (dark mode cards)

--text-primary:      #111111       (headings, body)
--text-secondary:    #6B7280       (labels, captions)
--text-muted:        #9CA3AF       (placeholders, hints)
--text-inverse:      #F9FAFB       (on dark surfaces)

--border:            #E5E7EB       (dividers, card borders)
--border-focus:      #111111       (input focus ring)

──── Accent ─────────────────────────────
--accent:            #2563EB       (primary actions, links)
--accent-hover:      #1D4ED8       (hover state)
--accent-light:      #EFF6FF       (accent backgrounds)

──── Semantic ───────────────────────────
--success:           #059669
--warning:           #D97706
--error:             #DC2626
--info:              #0284C7
```

### 2.2 Typography

```
Font Family:   "Inter", system-ui, -apple-system, sans-serif
Font Weights:  400 (body), 500 (labels), 600 (subheads), 700 (headings)

Scale:
--text-xs:     0.75rem  / 1rem       (captions, badges)
--text-sm:     0.875rem / 1.25rem    (secondary text, table cells)
--text-base:   1rem     / 1.5rem     (body text)
--text-lg:     1.125rem / 1.75rem    (card titles)
--text-xl:     1.25rem  / 1.75rem    (section headings)
--text-2xl:    1.5rem   / 2rem       (page headings)
--text-3xl:    1.875rem / 2.25rem    (dashboard hero numbers)
```

### 2.3 Spacing Scale

```
--space-1:   0.25rem   (4px)
--space-2:   0.5rem    (8px)
--space-3:   0.75rem   (12px)
--space-4:   1rem      (16px)
--space-5:   1.25rem   (20px)
--space-6:   1.5rem    (24px)
--space-8:   2rem      (32px)
--space-10:  2.5rem    (40px)
--space-12:  3rem      (48px)
--space-16:  4rem      (64px)
```

### 2.4 Borders & Radius

```
--radius-sm:   4px      (badges, tags)
--radius-md:   8px      (inputs, buttons)
--radius-lg:   12px     (cards, panels)
--radius-xl:   16px     (modals, hero cards)
--radius-full: 9999px   (avatars, pills)

--border-width: 1px
--border-color: var(--border)
```

### 2.5 Shadows

```
--shadow-sm:   0 1px 2px rgba(0,0,0,0.04)
--shadow-md:   0 2px 8px rgba(0,0,0,0.06)
--shadow-lg:   0 4px 16px rgba(0,0,0,0.08)
--shadow-xl:   0 8px 32px rgba(0,0,0,0.10)
```

### 2.6 Motion

```
--ease-default:  cubic-bezier(0.4, 0, 0.2, 1)
--duration-fast: 150ms    (button states, toggles)
--duration-base: 250ms    (panels, drawers)
--duration-slow: 350ms    (modals, page transitions)
```

---

## 3. Layout System

### 3.1 App Shell

```
┌──────────────────────────────────────────────────────┐
│  Top Bar  (56px height, sticky)                      │
│  ┌─────┬─────────────────────────────────────────┐   │
│  │     │  Breadcrumb / Page Title                │   │
│  │     ├─────────────────────────────────────────┤   │
│  │ S   │                                         │   │
│  │ i   │                                         │   │
│  │ d   │           Main Content Area             │   │
│  │ e   │           (scrollable)                  │   │
│  │ b   │                                         │   │
│  │ a   │                                         │   │
│  │ r   │                                         │   │
│  │     │                                         │   │
│  │64px │                                         │   │
│  └─────┴─────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

| Element      | Desktop                            | Mobile                               |
|--------------|------------------------------------|--------------------------------------|
| **Sidebar**  | 64px collapsed / 240px expanded    | Hidden; hamburger → overlay drawer   |
| **Top Bar**  | Logo · Search · Notifications · Avatar | Logo · Hamburger · Avatar         |
| **Content**  | Max-width 1280px, centered         | Full-width with 16px padding         |

### 3.2 Grid

```
Desktop:   12-column grid, 24px gap
Tablet:    8-column grid, 16px gap
Mobile:    4-column grid, 16px gap
```

### 3.3 Breakpoints

```
--bp-sm:    640px     (mobile landscape)
--bp-md:    768px     (tablet)
--bp-lg:    1024px    (laptop)
--bp-xl:    1280px    (desktop)
--bp-2xl:   1536px    (large desktop)
```

---

## 4. Component Library

### 4.1 Navigation

| Component          | Behavior                                                        |
|--------------------|-----------------------------------------------------------------|
| **Sidebar**        | Icon-only (64px) by default. Hover/pin to expand (240px). Active item: accent left-border + accent text. Sections: grouped with muted label headers. |
| **Breadcrumbs**    | Auto-generated from route. Clickable ancestors. Current page is non-linked bold text. |
| **Tabs**           | Underline style. Active = accent underline + bold. Lazy-load tab content. |
| **Bottom Nav**     | Mobile only. 5 icons max. Active = filled icon + accent dot.    |

### 4.2 Data Display

| Component          | Spec                                                             |
|--------------------|-----------------------------------------------------------------|
| **Data Table**     | Sticky header. Alternating row bg (subtle). Hover highlight. Sortable columns (chevron icon). Inline actions (icon buttons). Pagination: "1–20 of 342" with prev/next. |
| **Stat Card**      | Large number (text-3xl, font-700). Label below (text-sm, muted). Optional trend indicator (↑ green / ↓ red). White card + shadow-sm. |
| **Empty State**    | Centered illustration (minimal line art) + descriptive text + primary CTA button. |
| **Avatar**         | Circle. Sizes: 24/32/40/48px. Fallback: initials on accent-light bg. |
| **Badge**          | Pill shape. Variants: neutral, success, warning, error, info. text-xs. |
| **Skeleton Loader**| Pulse animation on neutral-200 bg. Match exact shape of target content. |

### 4.3 Forms

| Component          | Spec                                                             |
|--------------------|-----------------------------------------------------------------|
| **Text Input**     | 40px height. 1px border. Focus: 2px accent ring. Label above (text-sm, font-500). Error: red border + error text below. |
| **Textarea**       | Auto-resize. Min 3 rows. Character count bottom-right (muted).  |
| **Select**         | Custom dropdown. Search-filter for > 8 options. Multi-select with chips. |
| **Checkbox**       | 18×18px. Rounded-sm. Checked = accent fill + white check.       |
| **Radio**          | 18×18px. Circle. Selected = accent dot.                          |
| **Toggle**         | 36×20px. Pill track. Circle knob. Accent when on.               |
| **Date Picker**    | Calendar popup. Range selection for reports. Keyboard accessible.|
| **File Upload**    | Drag-and-drop zone. Dashed border. Preview thumbnail. Progress bar. |
| **Form Layout**    | Single column. Max-width 560px. Group related fields with subtle divider. |

### 4.4 Actions

| Component          | Spec                                                             |
|--------------------|-----------------------------------------------------------------|
| **Button — Primary**   | Accent bg, white text, radius-md. Height: 40px. Hover: darken 10%. Active: scale(0.98). Loading: spinner replaces text. |
| **Button — Secondary** | White bg, accent border, accent text. Same sizing.           |
| **Button — Ghost**     | No bg/border. Accent text. Hover: accent-light bg.           |
| **Button — Danger**    | Error-red bg, white text. Use only for destructive actions.  |
| **Icon Button**        | 36×36px. Ghost style. Tooltip on hover.                      |
| **FAB**                | 56×56px circle. Accent bg. Shadow-lg. Bottom-right fixed. Mobile only. |

### 4.5 Feedback

| Component          | Spec                                                             |
|--------------------|-----------------------------------------------------------------|
| **Toast**          | Bottom-right. Auto-dismiss 5s. Variants: success/error/info/warning. Dismiss icon. Stack up to 3. |
| **Modal**          | Centered. Overlay: rgba(0,0,0,0.4) + backdrop-blur(4px). Max-width 480px. Close on Esc + overlay click. |
| **Confirmation Dialog** | Modal variant. Icon + title + description + two buttons (cancel/confirm). |
| **Progress Bar**   | 4px height. Accent color. Animated fill. Percentage label optional. |
| **Inline Alert**   | Full-width banner. Left border (4px, semantic color). Icon + message. Dismissable. |

---

## 5. Page Specifications

### 5.1 Login Page

```
Layout:       Split — illustration left (60%) + form right (40%). Mobile: form only.
Elements:     College logo (48px) · "Welcome back" heading · Email input ·
              Password input (toggle visibility) · "Forgot password?" link ·
              Login button (full-width) · SSO divider ("or") · Google SSO button
Animation:    Fade-in form on load (duration-slow)
```

### 5.2 Dashboard — Student

```
Layout:       2-column grid (desktop) → 1-column (mobile)
Row 1:        Greeting card ("Good morning, {name}") with avatar + today's date
Row 2:        4× Stat Cards → Attendance %, CGPA, Fee Due (₹), Library Books
Row 3:        Today's Timetable (timeline view, left) + Announcements feed (right)
Row 4:        Upcoming Exams (table: subject, date, time) + Quick Links
```

### 5.3 Dashboard — Faculty

```
Row 1:        Greeting + today's schedule summary (next class in X min)
Row 2:        3× Stat Cards → Classes Today, Leave Balance, Pending Marks Entry
Row 3:        Today's Classes (cards with "Mark Attendance" CTA) + Notices
Row 4:        Recent Activity feed
```

### 5.4 Dashboard — Admin

```
Row 1:        4× KPI Stat Cards → Total Students, Fee Collection %, Avg Attendance, Placement Rate
Row 2:        Enrollment Trend (line chart) + Department-wise Attendance (bar chart)
Row 3:        Recent Admissions table + Fee Defaulters table
Row 4:        Quick Actions grid (Add Student, Generate Report, Send Notice, Manage Fees)
```

### 5.5 Attendance Marking (Faculty)

```
Step 1:       Select → Department, Semester, Section, Subject, Lecture (dropdowns in a row)
Step 2:       Student list loads as a clean table:
              | Roll No | Name | Status [P/A/L toggle] |
              Bulk actions: "Mark All Present" / "Mark All Absent"
Step 3:       Floating "Save" button at bottom. Confirm toast on success.
Mobile:       Card-based list (one card per student) with tap-to-toggle status.
```

### 5.6 Student Profile

```
Layout:       Left column (320px) — Avatar, name, admission no, branch, year, status badge
              Right column — Tabbed content:
                Tab 1: Personal Info (read-only fields, "Edit" button)
                Tab 2: Academic (semester-wise results table, CGPA chart)
                Tab 3: Attendance (subject-wise bars + calendar heatmap)
                Tab 4: Fee (payment history table + due amount card)
                Tab 5: Documents (uploaded docs with status badges)
```

### 5.7 Fee Payment

```
Layout:       Single centered card (max-width 560px)
Elements:     Fee breakdown table (head, amount) → Subtotal (bold) →
              Scholarship deduction (if any, green) → Total Due (text-2xl, accent) →
              "Pay Now" button → Redirects to gateway → Return to receipt page
Receipt:      Downloadable card with QR code, receipt number, payment details
```

### 5.8 Exam Results

```
Selector:     Semester pills (horizontal scroll)
Table:        Subject | Internal | External | Total | Grade | Credits | Grade Points
Footer:       SGPA for selected semester
Bottom card:  Cumulative CGPA (large number) + semester-wise trend (sparkline)
Actions:      "Download Transcript" button
```

### 5.9 Library Search

```
Top:          Search bar (full-width, 48px, icon left) + filter pills (Category, Available)
Results:      Card grid (3 cols desktop, 1 col mobile)
Card:         Book cover thumbnail (or placeholder) · Title · Author · ISBN ·
              Availability badge (green/red) · "Reserve" or "View Details" CTA
Empty State:  "No books found" + illustration
```

### 5.10 Reports Page (Admin)

```
Top:          Report type dropdown + Date range picker + Department filter + "Generate" button
Output:       Embeds chart/table preview below
Actions:      "Export PDF" | "Export Excel" | "Schedule" buttons
```

### 5.11 Timetable View

```
Student:      Weekly grid (Mon–Sat rows × period columns). Cell: Subject code + Room.
              Color-coded by subject. Current period highlighted.
Faculty:      Same grid but showing assigned classes. Free periods = muted background.
Mobile:       Day-view with swipe to change day. List layout.
```

### 5.12 Communication — Announcements

```
Layout:       Feed view (single column, max-width 720px, centered)
Card:         Author avatar + name + timestamp · Title (text-lg, font-600) ·
              Body (text-base, truncated 3 lines, "Read more") · Attachments (file chips) ·
              Scope badge (All / Dept / Class)
Compose:      Modal with rich-text editor. Scope selector. Attachment upload. "Post" button.
```

---

## 6. Interaction Patterns

### 6.1 Loading States

| Scenario              | Pattern                                                    |
|-----------------------|------------------------------------------------------------|
| Initial page load     | Skeleton screen matching page layout                       |
| Table data fetch      | Skeleton rows (5 rows) replacing table body                |
| Button action         | Button text → spinner. Disable to prevent double-submit.   |
| File upload           | Progress bar under drag zone. Percentage + file name.      |
| Infinite scroll       | Spinner at bottom. Load 20 items per batch.                |

### 6.2 Error States

| Scenario              | Pattern                                                    |
|-----------------------|------------------------------------------------------------|
| Form validation       | Inline red text below field. Field border turns red.        |
| API failure           | Toast (error variant): "Something went wrong. Try again."  |
| 404 page              | Centered: "Page not found" + illustration + "Go Home" btn  |
| Network offline       | Persistent top banner: "You're offline. Changes will sync."|

### 6.3 Empty States

| Scenario              | Pattern                                                    |
|-----------------------|------------------------------------------------------------|
| No search results     | Illustration + "No results for '{query}'" + suggestion     |
| No data yet           | Illustration + "No {items} yet" + CTA to create first item |
| No notifications      | Illustration + "You're all caught up!"                     |

### 6.4 Confirmation Flows

| Action Type           | Pattern                                                    |
|-----------------------|------------------------------------------------------------|
| Non-destructive save  | Immediate save + success toast                             |
| Destructive action    | Confirmation dialog with explicit action name in CTA       |
| Bulk operations       | Confirm count: "Delete 12 students?" (Danger button)       |
| Payment               | Review step before gateway redirect                        |

---

## 7. Accessibility Requirements

| Requirement                   | Implementation                                           |
|-------------------------------|----------------------------------------------------------|
| Keyboard navigation           | All interactive elements focusable. Tab order logical.   |
| Focus indicators               | 2px accent ring on focus-visible. Never remove.          |
| Screen reader support          | Semantic HTML. ARIA labels on icons. Live regions for toasts. |
| Color contrast                 | Min 4.5:1 for body text, 3:1 for large text (WCAG AA).  |
| Reduced motion                 | `prefers-reduced-motion`: disable animations, use instant transitions. |
| Form labels                    | Every input has a visible `<label>`. Required fields marked with `*`. |
| Error announcements            | `aria-live="polite"` on form error containers.            |

---

## 8. Responsive Behavior

| Element            | ≥ 1024px (Desktop)          | 768–1023px (Tablet)       | < 768px (Mobile)           |
|--------------------|-----------------------------|---------------------------|----------------------------|
| Sidebar            | Visible, collapsible        | Collapsed (icons only)    | Hidden → drawer on tap     |
| Stat Cards         | 4 per row                   | 2 per row                 | 1 per row (stacked)        |
| Data Tables        | Full columns                | Hide low-priority cols    | Card layout per row        |
| Charts             | Side-by-side                | Stacked                   | Stacked, full-width        |
| Forms              | 2-column for short fields   | Single column             | Single column              |
| Modals             | Centered overlay            | Centered overlay          | Full-screen bottom sheet   |
| Timetable          | Week grid                   | Week grid (compact)       | Day-view (swipe)           |

---

## 9. Dark Mode

| Token               | Light Value          | Dark Value            |
|----------------------|----------------------|-----------------------|
| `--bg-primary`       | #FAFAFA              | #0F0F0F               |
| `--bg-secondary`     | #FFFFFF              | #1A1A1A               |
| `--text-primary`     | #111111              | #F9FAFB               |
| `--text-secondary`   | #6B7280              | #9CA3AF               |
| `--border`           | #E5E7EB              | #2D2D2D               |
| `--shadow-*`         | rgba(0,0,0,...)      | rgba(0,0,0,...)  (stronger) |
| `--accent`           | #2563EB              | #3B82F6  (slightly brighter)|

Toggle: User preference stored in localStorage. Respects `prefers-color-scheme` as default.

---

## 10. Charts & Data Visualization

| Chart Type           | Use Case                                    | Library        |
|----------------------|---------------------------------------------|----------------|
| Line chart           | Enrollment trends, attendance over time     | Recharts       |
| Bar chart            | Department-wise comparisons                 | Recharts       |
| Donut chart          | Fee collection breakdown, category splits   | Recharts       |
| Sparkline            | Inline CGPA trends, mini attendance graphs  | Recharts       |
| Calendar heatmap     | Student attendance calendar view            | Custom / D3    |

**Chart Style**: Minimal gridlines (dashed, muted). No chart borders. Accent color for primary dataset. Tooltip on hover. Responsive resize.

---

## 11. Icon & Asset Guidelines

| Aspect               | Spec                                                       |
|-----------------------|------------------------------------------------------------|
| Icon set              | Lucide Icons (outlined, 1.5px stroke)                     |
| Icon sizes            | 16px (inline), 20px (nav/buttons), 24px (headers), 48px (empty states) |
| Illustrations         | Minimal line-art style, monochrome + accent color          |
| College logo          | SVG, displayed at 40px height in header                    |
| Avatars               | User-uploaded photo or initials on accent-light circle     |
| File type icons       | Minimal variants for PDF, XLSX, DOCX, JPG                  |

---

## 12. Performance Budget

| Metric                | Target                           |
|-----------------------|----------------------------------|
| First Contentful Paint| ≤ 1.2s                           |
| Largest Contentful Paint | ≤ 2.0s                        |
| Cumulative Layout Shift | ≤ 0.1                          |
| First Input Delay     | ≤ 100ms                         |
| Total JS bundle (gzipped) | ≤ 200KB (initial route)     |
| Total CSS (gzipped)   | ≤ 30KB                          |
| Image optimization    | WebP with fallback. Lazy-load below-fold. |
| Font loading          | `font-display: swap`. Subset Inter to Latin. |

---

## 13. Tech Implementation Notes

| Decision              | Rationale                                                  |
|-----------------------|------------------------------------------------------------|
| **Next.js 14 (App Router)** | SSR for SEO on public pages. RSC for dashboard perf. |
| **CSS Modules + CSS Variables** | Scoped styles. Design tokens as custom properties. No utility-class bloat. |
| **Inter (Google Fonts)** | Best readability at small sizes. Widely supported.      |
| **Lucide React**      | Tree-shakeable. Consistent with minimalist aesthetic.      |
| **Recharts**          | Lightweight React charting. Composable. Responsive.        |
| **React Hook Form + Zod** | Performant forms with schema-based validation.         |
| **Tanstack Query**    | Server state management. Caching. Optimistic updates.      |
| **Framer Motion**     | Declarative animations. Respects `prefers-reduced-motion`. |

---

## 14. Complete Page Inventory

> **Total Pages: 52** (across 14 modules + global pages)

---

### 14.1 Global / Shared Pages — 4 pages

| #  | Page Name          | Route              | Roles               | Layout    |
|----|--------------------|--------------------|----------------------|-----------|
| 1  | Landing / Home     | `/`                | Public               | Full-page |
| 2  | 404 Not Found      | `/404`             | All                  | Full-page |
| 3  | 500 Server Error   | `/500`             | All                  | Full-page |
| 4  | Settings           | `/settings`        | All authenticated    | App Shell |

---

### 14.2 Auth Module — 5 pages `(MVP)`

| #  | Page Name                | Route                    | Roles     | Syncs With                     |
|----|--------------------------|--------------------------|-----------|--------------------------------|
| 5  | Login                    | `/login`                 | Public    | → Session Store → Role Router  |
| 6  | Forgot Password          | `/forgot-password`       | Public    | → Email/SMS Service            |
| 7  | Reset Password           | `/reset-password/[token]`| Public    | → Auth Service                 |
| 8  | Email Verification       | `/verify-email/[token]`  | Public    | → User status flag             |
| 9  | OTP Verification         | `/verify-otp`            | Public    | → Session Store                |

---

### 14.3 Dashboard Module — 4 pages `(MVP)`

| #  | Page Name                | Route                    | Roles     | Syncs With                                         |
|----|--------------------------|--------------------------|-----------|----------------------------------------------------|
| 10 | Student Dashboard        | `/dashboard`             | Student   | ← Attendance · Fees · Exams · Timetable · Notices |
| 11 | Faculty Dashboard        | `/dashboard`             | Faculty   | ← Timetable · Leave · Attendance · Notices        |
| 12 | Admin Dashboard          | `/dashboard`             | Admin, SA | ← All KPI data sources (see §15 sync matrix)      |
| 13 | HOD Dashboard            | `/dashboard`             | HOD       | ← Dept Attendance · Faculty · Course Allocation    |

> **Note:** Single `/dashboard` route renders role-specific view via RBAC middleware.

---

### 14.4 Student Information Module — 5 pages `(MVP)`

| #  | Page Name                | Route                    | Roles           | Syncs With                              |
|----|--------------------------|--------------------------|-----------------|-----------------------------------------|
| 14 | Student List             | `/students`              | Admin, HOD      | → Student Profile · Attendance · Fees   |
| 15 | Student Profile          | `/students/[id]`         | Admin, HOD, Fac | ← Attendance · Results · Fees · Docs    |
| 16 | My Profile               | `/profile`               | Student         | ← same data as Student Profile (self)   |
| 17 | Add / Edit Student       | `/students/new`          | Admin           | → Student List (refetch on save)        |
| 18 | Bulk Import Students     | `/students/import`       | Admin           | → Student List (refetch on complete)    |

---

### 14.5 Admission Module — 4 pages `(v1.1)`

| #  | Page Name                | Route                    | Roles           | Syncs With                              |
|----|--------------------------|--------------------------|-----------------|-----------------------------------------|
| 19 | Application Form         | `/admissions/apply`      | Public          | → Admission List                        |
| 20 | Application Tracker      | `/admissions/status`     | Public/Student  | ← Admission status updates              |
| 21 | Admission List (Admin)   | `/admissions`            | Admin           | → Student List (on confirm)             |
| 22 | Seat Matrix              | `/admissions/seats`      | Admin           | ← Admission confirmations               |

---

### 14.6 Attendance Module — 4 pages `(MVP)`

| #  | Page Name                | Route                    | Roles           | Syncs With                              |
|----|--------------------------|--------------------------|-----------------|-----------------------------------------|
| 23 | Mark Attendance          | `/attendance/mark`       | Faculty         | → Student Dashboard · Attendance Report · Notification Service |
| 24 | My Attendance            | `/attendance/my`         | Student         | ← Mark Attendance writes                |
| 25 | Attendance Report        | `/attendance/report`     | Admin, HOD, Fac | ← Mark Attendance writes                |
| 26 | Condonation Requests     | `/attendance/condonation`| Student, HOD    | → My Attendance (on approval)           |

---

### 14.7 Examination Module — 6 pages `(v1.1)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 27 | Exam Schedule            | `/exams`                     | All auth         | → Hall Tickets · Student Dashboard     |
| 28 | Hall Ticket              | `/exams/hall-ticket`         | Student          | ← Exam Schedule · Fee status           |
| 29 | Mark Entry               | `/exams/marks`               | Faculty, ExamCell| → Results · Grade Computation          |
| 30 | Results (Student)        | `/results`                   | Student          | ← Mark Entry · Grade Computation       |
| 31 | Transcript Download      | `/results/transcript`        | Student          | ← Results data                         |
| 32 | Revaluation Request      | `/exams/revaluation`         | Student          | → Exam Cell queue · Fee Service        |

---

### 14.8 Fee & Finance Module — 5 pages `(MVP)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 33 | Fee Overview             | `/fees`                      | Student          | ← Fee Structure · Payment History      |
| 34 | Pay Fees                 | `/fees/pay`                  | Student          | → Payment Gateway → Receipt Gen        |
| 35 | Fee Receipt              | `/fees/receipt/[id]`         | Student, Admin   | ← Payment confirmation webhook         |
| 36 | Fee Structure (Admin)    | `/fees/manage`               | Admin            | → Fee Overview (all students)          |
| 37 | Defaulter Report         | `/fees/defaulters`           | Admin, Accounts  | ← Payment data · Student data          |

---

### 14.9 Timetable Module — 3 pages `(v1.1)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 38 | View Timetable           | `/timetable`                 | Student, Faculty | ← Timetable Config                    |
| 39 | Manage Timetable         | `/timetable/manage`          | Admin            | → View Timetable · Faculty Dashboard   |
| 40 | Substitution Manager     | `/timetable/substitution`    | Admin, HOD       | ← Leave applications · Faculty slots   |

---

### 14.10 Course & Curriculum Module — 3 pages `(v1.1)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 41 | Course Catalog           | `/courses`                   | All auth         | ← Course data                         |
| 42 | Course Registration      | `/courses/register`          | Student          | → Timetable · Attendance (new entries) |
| 43 | Syllabus & CO Mapping    | `/courses/[id]/syllabus`     | Faculty, HOD     | → NAAC/NBA Reports                     |

---

### 14.11 Faculty & HR Module — 4 pages `(v1.2)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 44 | Faculty Directory        | `/faculty`                   | Admin, HOD       | → Faculty Profile                      |
| 45 | Faculty Profile          | `/faculty/[id]`              | Admin, HOD, Self | ← Workload · Leave · Publications      |
| 46 | Leave Application        | `/leave`                     | Faculty          | → HOD Approval · Timetable Substitution|
| 47 | Leave Approvals          | `/leave/approvals`           | HOD              | ← Leave Applications                   |

---

### 14.12 Library Module — 3 pages `(v1.2)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 48 | Library Search           | `/library`                   | All auth         | → Issue/Return records                 |
| 49 | My Books                 | `/library/my-books`          | Student, Faculty | ← Issue/Return records                 |
| 50 | Library Admin            | `/library/manage`            | Librarian        | → Library Search availability          |

---

### 14.13 Communication Module — 2 pages `(MVP)`

| #  | Page Name                | Route                        | Roles            | Syncs With                             |
|----|--------------------------|------------------------------|------------------|----------------------------------------|
| 51 | Announcements            | `/announcements`             | All auth         | → Notification Service → Dashboards    |
| 52 | Academic Calendar        | `/calendar`                  | All auth         | ← Exam Schedule · Holidays             |

---

### 14.14 Reports & Analytics — 2 pages `(v1.2)`

| #  | Page Name                | Route                        | Roles              | Syncs With                            |
|----|--------------------------|------------------------------|--------------------|---------------------------------------|
| 53 | Reports Builder          | `/reports`                   | Admin, HOD, ExamCell| ← All module data via aggregation API|
| 54 | NAAC / NBA Report Gen    | `/reports/accreditation`     | Admin               | ← CO/PO mapping · Results · Attendance|

---

### 14.15 Placement Module — 3 pages `(v2.0)`

| #  | Page Name                | Route                        | Roles              | Syncs With                           |
|----|--------------------------|------------------------------|--------------------|------------------------------------- |
| 55 | Placement Dashboard      | `/placement`                 | Student, Placement | ← Drive data · Eligibility filter    |
| 56 | Placement Drives         | `/placement/drives`          | Placement Officer  | → Placement Dashboard                |
| 57 | Company Database         | `/placement/companies`       | Placement Officer  | → Placement Drives                   |

---

### 14.16 Hostel Module — 3 pages `(v2.0)`

| #  | Page Name                | Route                        | Roles              | Syncs With                           |
|----|--------------------------|------------------------------|--------------------|------------------------------------- |
| 58 | Hostel Overview          | `/hostel`                    | Student, Warden    | ← Room allocation · Complaint status |
| 59 | Room Allocation          | `/hostel/rooms`              | Warden, Admin      | → Hostel Overview                    |
| 60 | Hostel Complaints        | `/hostel/complaints`         | Student, Warden    | ← bidirectional updates              |

---

## 15. Cross-Page Data Sync Matrix

> Every page reads from or writes to shared data. This matrix shows **how changes on one page propagate to others in real-time or on next fetch.**

### 15.1 Sync Strategy

| Strategy              | Mechanism                                    | Used For                                |
|-----------------------|----------------------------------------------|-----------------------------------------|
| **Optimistic Update** | Tanstack Query `setQueryData` on mutation    | Attendance marking, leave applying      |
| **Cache Invalidation**| `invalidateQueries` after server confirms    | Fee payment, mark entry, student CRUD   |
| **Server Push (SSE)** | Server-Sent Events on dashboard              | Live KPI updates, notification count    |
| **Polling**           | 30s interval on active dashboards            | Fallback when SSE unavailable           |
| **Shared Query Keys** | Same query key across pages = auto-sync      | Student profile data, fee status        |

### 15.2 Data Flow Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        WRITE EVENTS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mark Attendance (#23) ──writes──→  [attendance_records]        │
│       ├── invalidates → My Attendance (#24)                     │
│       ├── invalidates → Attendance Report (#25)                 │
│       ├── invalidates → Student Dashboard (#10) stat cards      │
│       └── triggers ───→ Notification Service (if < 75%)         │
│                                                                 │
│  Pay Fees (#34) ──writes──→  [fee_transactions]                 │
│       ├── invalidates → Fee Overview (#33)                      │
│       ├── invalidates → Fee Receipt (#35) (new receipt)         │
│       ├── invalidates → Defaulter Report (#37)                  │
│       ├── invalidates → Student Dashboard (#10) fee card        │
│       └── invalidates → Admin Dashboard (#12) KPI widget        │
│                                                                 │
│  Enter Marks (#29) ──writes──→  [exam_results]                  │
│       ├── invalidates → Results (#30) (after publish)           │
│       ├── invalidates → Transcript (#31)                        │
│       ├── invalidates → Student Profile (#15) academic tab      │
│       └── invalidates → Admin Dashboard (#12) pass % widget     │
│                                                                 │
│  Apply Leave (#46) ──writes──→  [leave_applications]            │
│       ├── invalidates → Leave Approvals (#47)                   │
│       ├── invalidates → Faculty Dashboard (#11) leave card      │
│       └── triggers ───→ Substitution Manager (#40) alert        │
│                                                                 │
│  Post Announcement (#51) ──writes──→  [announcements]           │
│       ├── invalidates → All Dashboards (#10, #11, #12, #13)     │
│       └── triggers ───→ Notification Service (email/SMS/push)   │
│                                                                 │
│  Add Student (#17) ──writes──→  [students]                      │
│       ├── invalidates → Student List (#14)                      │
│       ├── invalidates → Admin Dashboard (#12) count widget      │
│       └── creates ────→ empty records in attendance, fees       │
│                                                                 │
│  Register Course (#42) ──writes──→  [enrollments]               │
│       ├── invalidates → Timetable (#38) (new classes show up)   │
│       └── invalidates → Attendance module (new subjects appear) │
│                                                                 │
│  Issue/Return Book (#50) ──writes──→  [library_issues]          │
│       ├── invalidates → My Books (#49)                          │
│       ├── invalidates → Library Search (#48) availability count │
│       └── invalidates → Student Dashboard (#10) library card    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 15.3 Global Shared State

| State Key               | Stored In         | Consumed By                                     |
|--------------------------|-------------------|-------------------------------------------------|
| `currentUser`            | Auth Context      | All pages — role check, name, avatar, dept       |
| `notifications[]`        | Tanstack Query    | Top bar badge • Notification dropdown            |
| `notificationCount`      | SSE / Polling     | Top bar badge (real-time number)                 |
| `theme` (light/dark)     | localStorage      | All pages — CSS variable swap                    |
| `sidebarCollapsed`       | localStorage      | App Shell sidebar state                          |
| `academicYear`           | Context / URL     | All module pages — filters data scope            |
| `selectedSemester`       | URL param         | Results · Attendance · Timetable                 |
| `breadcrumbs`            | Route-derived     | Top bar breadcrumb component                     |

### 15.4 Tanstack Query Key Convention

```
All pages sharing the same entity use identical query keys:

["students"]                     → Student List, Admin Dashboard count
["students", id]                 → Student Profile, My Profile
["attendance", studentId, sem]   → My Attendance, Student Profile tab
["attendance", classId, date]    → Mark Attendance form
["fees", studentId]              → Fee Overview, Student Profile tab
["fees", "defaulters", filters]  → Defaulter Report
["results", studentId, sem]      → Results, Transcript, Student Profile tab
["timetable", targetId, week]    → Timetable view (student or faculty)
["announcements", scope, page]   → Announcements feed, Dashboard widgets
["library", "search", query]     → Library Search
["library", "my-books", userId]  → My Books
["notifications", userId]        → Notification dropdown
```

> When any mutation writes to an entity, **all queries with matching key prefix are invalidated** → every page showing that data re-fetches automatically.

---

## 16. Page Count Summary

| Module                     | Pages | Priority | Route Prefix        |
|----------------------------|-------|----------|---------------------|
| Global / Shared            | 4     | MVP      | `/`, `/404`, `/500`, `/settings` |
| Auth                       | 5     | MVP      | `/login`, `/forgot-password`, `/reset-password`, `/verify-*` |
| Dashboards                 | 4     | MVP      | `/dashboard` (role-based) |
| Student Information        | 5     | MVP      | `/students/*`, `/profile` |
| Attendance                 | 4     | MVP      | `/attendance/*`     |
| Fee & Finance              | 5     | MVP      | `/fees/*`           |
| Communication              | 2     | MVP      | `/announcements`, `/calendar` |
| **MVP Subtotal**           | **29**|          |                     |
| Admission                  | 4     | v1.1     | `/admissions/*`     |
| Examination                | 6     | v1.1     | `/exams/*`, `/results/*` |
| Timetable                  | 3     | v1.1     | `/timetable/*`      |
| Courses                    | 3     | v1.1     | `/courses/*`        |
| **v1.1 Subtotal**          | **16**|          |                     |
| Faculty & HR               | 4     | v1.2     | `/faculty/*`, `/leave/*` |
| Library                    | 3     | v1.2     | `/library/*`        |
| Reports                    | 2     | v1.2     | `/reports/*`        |
| **v1.2 Subtotal**          | **9** |          |                     |
| Placement                  | 3     | v2.0     | `/placement/*`      |
| Hostel                     | 3     | v2.0     | `/hostel/*`         |
| **v2.0 Subtotal**          | **6** |          |                     |
| ────────────────           | ───── | ──────── | ─────────────────── |
| **Grand Total**            | **60**|          |                     |

---

*End of Frontend Requirements*
