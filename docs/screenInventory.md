# Screen Inventory
# College ERP System — Detailed Screen Breakdown

---

| Field            | Value            |
|------------------|------------------|
| **Version**      | 1.0              |
| **Date**         | 2026-04-14       |
| **Total Pages**  | 60               |
| **Total Screens**| **187**          |
| **Ref**          | frontendReq v1.0 |

---

> **Page vs Screen:**
> A *page* is a unique route. A *screen* is a distinct visual state the user sees — including modals, drawers, empty states, confirmation dialogs, and role-specific views within a single page.

---

## 1. Global / Shared — 11 screens

### Page 1: Landing / Home `/`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 1 | Hero Section            | College banner, tagline, login CTA, feature highlights   |
| 2 | About Section           | Brief about the institution, stats counters              |
| 3 | Footer                  | Links, contact, social                                   |

### Page 2: 404 Not Found `/404`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 4 | 404 View                | Illustration + "Page not found" + Go Home button         |

### Page 3: 500 Server Error `/500`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 5 | 500 View                | Illustration + "Something went wrong" + Retry/Home       |

### Page 4: Settings `/settings`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 6 | Profile Settings Tab    | Edit name, email, phone, avatar upload                   |
| 7 | Security Tab            | Change password, active sessions, MFA toggle             |
| 8 | Notification Prefs Tab  | Toggle email/SMS/push per notification type              |
| 9 | Appearance Tab          | Theme toggle (light/dark), language selector             |
| 10| Confirm Password Modal  | Before sensitive changes (email, password)               |
| 11| Session Revoke Dialog   | "Logout from all other devices?" confirmation            |

---

## 2. Auth Module — 9 screens

### Page 5: Login `/login`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 12| Login Form              | Email + password fields, submit, forgot link, SSO        |
| 13| Account Locked State    | "Too many attempts. Try again in X min."                 |

### Page 6: Forgot Password `/forgot-password`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 14| Request Form            | Enter email/phone → Send OTP/link                        |
| 15| Success Confirmation    | "Reset link sent to your email" message                  |

### Page 7: Reset Password `/reset-password/[token]`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 16| New Password Form       | New password + confirm password fields                   |
| 17| Link Expired State      | "This link has expired. Request a new one."              |

### Page 8: Email Verification `/verify-email/[token]`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 18| Verification Success    | "Email verified! Redirecting to login..."                |
| 19| Verification Failed     | "Invalid or expired link" + Resend button                |

### Page 9: OTP Verification `/verify-otp`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 20| OTP Input               | 6-digit code input + Resend timer + Submit               |

---

## 3. Dashboard Module — 16 screens

### Page 10: Student Dashboard `/dashboard`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 21| Greeting Bar            | "Good morning, {name}" + date + avatar                   |
| 22| Stat Cards Row          | Attendance %, CGPA, Fee Due ₹, Library Books             |
| 23| Today's Timetable       | Timeline view of today's classes                         |
| 24| Announcements Feed      | Latest 5 announcements with "View All" link              |
| 25| Upcoming Exams Widget   | Next 3 exams in table format                             |

### Page 11: Faculty Dashboard `/dashboard`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 26| Greeting + Schedule     | Next class countdown + today's schedule summary          |
| 27| Stat Cards Row          | Classes Today, Leave Balance, Pending Marks              |
| 28| Today's Classes Cards   | Per-class card with "Mark Attendance" CTA                |
| 29| Notices Widget          | Recent department notices                                |

### Page 12: Admin Dashboard `/dashboard`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 30| KPI Stat Cards          | Total Students, Fee %, Avg Attendance, Placement Rate    |
| 31| Charts Row              | Enrollment trend line chart + Dept attendance bar chart   |
| 32| Tables Row              | Recent admissions table + Fee defaulters table           |
| 33| Quick Actions Grid      | Add Student, Generate Report, Send Notice, Manage Fees   |

### Page 13: HOD Dashboard `/dashboard`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 34| Department KPIs         | Dept student count, avg attendance, pass rate             |
| 35| Faculty Workload        | Faculty list with teaching hours this week               |
| 36| Pending Approvals       | Leave requests, condonation requests needing action      |

---

## 4. Student Information Module — 14 screens

### Page 14: Student List `/students`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 37| Search + Filter Bar     | Full-text search, branch/batch/year/section dropdowns    |
| 38| Students Table          | Sortable table with avatar, name, roll, branch, actions  |
| 39| Empty State             | "No students found" + Add Student CTA                    |
| 40| Delete Confirmation     | "Deactivate {name}?" dialog                              |

### Page 15: Student Profile `/students/[id]`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 41| Profile Header          | Avatar, name, admission no, branch, year, status badge   |
| 42| Personal Info Tab       | Read-only fields grid + "Edit" toggle                    |
| 43| Academic Tab            | Semester-wise results table + CGPA sparkline             |
| 44| Attendance Tab          | Subject-wise bar chart + calendar heatmap                |
| 45| Fee Tab                 | Payment history table + outstanding due card             |
| 46| Documents Tab           | Uploaded documents with status badges (verified/pending) |

### Page 16: My Profile `/profile`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 47| Self Profile View       | Same as Student Profile but for logged-in student (self) |

### Page 17: Add / Edit Student `/students/new`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 48| Student Form            | Multi-section form: personal, guardian, academic, photo  |
| 49| Unsaved Changes Dialog  | "You have unsaved changes. Discard?" on navigation       |

### Page 18: Bulk Import `/students/import`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 50| Upload Zone             | Drag-drop CSV/Excel + template download link             |
| 51| Preview & Validation    | Table preview with row-level error highlights            |
| 52| Import Progress         | Progress bar + success/error count summary               |

---

## 5. Admission Module — 10 screens

### Page 19: Application Form `/admissions/apply`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 53| Multi-Step Form         | Step 1: Personal · Step 2: Academic · Step 3: Documents · Step 4: Review |
| 54| Step Progress Indicator | Horizontal stepper showing current/completed steps       |
| 55| Submission Confirmation | "Application submitted! Your ID: {id}" + tracker link   |

### Page 20: Application Tracker `/admissions/status`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 56| Status Timeline         | Vertical timeline: Applied → Under Review → Accepted/Rejected |

### Page 21: Admission List `/admissions`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 57| Applications Table      | Filterable table with status badge, actions (approve/reject) |
| 58| Approve/Reject Modal    | Remarks field + action buttons + auto-creates student record |

### Page 22: Seat Matrix `/admissions/seats`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 59| Matrix Grid             | Branch × Category grid showing filled/total seats        |
| 60| Capacity Edit Modal     | Update seat limits per branch/category                   |

---

## 6. Attendance Module — 12 screens

### Page 23: Mark Attendance `/attendance/mark`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 61| Class Selector          | Dept, semester, section, subject, lecture dropdowns       |
| 62| Student List View       | Table with P/A/L toggles per student (desktop)           |
| 63| Student Card View       | Card-based tap-to-toggle layout (mobile)                 |
| 64| Save Confirmation Toast | "Attendance saved for {subject}" success feedback        |

### Page 24: My Attendance `/attendance/my`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 65| Overall Summary         | Large percentage + circular progress ring                |
| 66| Subject-wise Breakdown  | Horizontal bars per subject with % labels                |
| 67| Calendar Heatmap        | Monthly calendar with color-coded attendance days        |
| 68| Shortage Warning Banner | Inline alert when any subject < 75%                      |

### Page 25: Attendance Report `/attendance/report`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 69| Filter Controls         | Dept, class, subject, date range filters                 |
| 70| Report Table            | Students × dates matrix OR summary view toggle           |
| 71| Export Actions           | Export PDF / Export Excel buttons                         |

### Page 26: Condonation Requests `/attendance/condonation`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 72| Request Form (Student)  | Select subject, upload proof, write reason               |
| 73| Requests Queue (HOD)    | Table with approve/reject actions + remarks field        |

---

## 7. Examination Module — 18 screens

### Page 27: Exam Schedule `/exams`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 74| Exam Calendar View      | Calendar with exam dates highlighted                     |
| 75| Exam List View          | Table: subject, type, date, time, venue                  |
| 76| Create Exam Modal       | Exam type, subject, date, time, venue selector (Admin)   |
| 77| Clash Warning Alert     | Red inline alert if scheduling conflict detected         |

### Page 28: Hall Ticket `/exams/hall-ticket`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 78| Hall Ticket Preview     | Student photo, seat no, exam timetable, QR code          |
| 79| Blocked State           | "Hall ticket blocked: pending fee / low attendance"      |

### Page 29: Mark Entry `/exams/marks`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 80| Subject + Exam Selector | Dropdowns to select subject and exam type                |
| 81| Marks Table             | Student list with marks input fields + max marks display |
| 82| Moderation View (HOD)   | Review entered marks + approve/request revision          |
| 83| Submit Confirmation     | "Marks submitted for moderation" toast                   |

### Page 30: Results `/results`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 84| Semester Picker         | Horizontal pill selector for each semester               |
| 85| Results Table           | Subject × marks × grade × credits × grade points        |
| 86| SGPA / CGPA Card        | Large CGPA number + semester trend sparkline              |

### Page 31: Transcript Download `/results/transcript`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 87| Transcript Preview      | Full transcript in print-ready layout                    |
| 88| Download Actions        | "Download PDF" + "Print" buttons                         |

### Page 32: Revaluation Request `/exams/revaluation`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 89| Subject Selector        | Select subjects to reapply + fee per subject shown       |
| 90| Payment + Submit        | Total fee + Pay & Submit CTA                             |
| 91| Status Tracker          | Applied → Under Review → Result Updated timeline         |

---

## 8. Fee & Finance Module — 15 screens

### Page 33: Fee Overview `/fees`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 92| Due Amount Card         | Total due (large number) + due date + pay button         |
| 93| Fee Breakdown Table     | Fee head × amount breakdown                              |
| 94| Payment History Tab     | Past payments table with receipt download links          |
| 95| Scholarship Banner      | If applicable: "Scholarship of ₹{x} applied"            |

### Page 34: Pay Fees `/fees/pay`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
| 96| Review Order             | Fee breakdown summary + total + scholarship deduction   |
| 97| Payment Method Selector | UPI / Net Banking / Card / Wallet options                |
| 98| Gateway Redirect        | Loading spinner while redirecting to payment gateway     |
| 99| Payment Success         | ✓ checkmark animation + receipt ID + download link       |
|100| Payment Failed          | ✗ icon + "Payment failed. Try again." + retry button     |

### Page 35: Fee Receipt `/fees/receipt/[id]`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|101| Receipt View            | College header, receipt no, QR code, payment details     |
|102| Download / Print Bar    | "Download PDF" + "Print" buttons                         |

### Page 36: Fee Structure Admin `/fees/manage`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|103| Fee Heads Table         | Configurable fee heads per branch/year/category          |
|104| Edit Fee Modal          | Inline edit fee amounts + save                           |
|105| Version History         | Past fee structure versions with diffs                   |

### Page 37: Defaulter Report `/fees/defaulters`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|106| Filter Bar              | Branch, year, amount range, due date range               |
|107| Defaulters Table        | Students with outstanding amounts, sorted by due amount  |
|108| Send Reminder Action    | Bulk select + "Send Reminder" button + confirm dialog    |

---

## 9. Timetable Module — 9 screens

### Page 38: View Timetable `/timetable`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|109| Week Grid (Desktop)     | Mon–Sat × periods. Color-coded cells. Current highlight. |
|110| Day View (Mobile)       | Single day list with swipe navigation                    |
|111| Legend                  | Color → subject mapping key                              |

### Page 39: Manage Timetable `/timetable/manage`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|112| Section Selector        | Branch, semester, section dropdown                       |
|113| Editable Grid           | Drag-and-drop assignment of subjects to slots            |
|114| Clash Detection Banner  | Inline alert showing room/faculty conflicts              |

### Page 40: Substitution Manager `/timetable/substitution`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|115| Today's Absences        | List of faculty on leave today with affected periods     |
|116| Suggested Substitutes   | Auto-suggest available faculty for each slot             |
|117| Assign Confirmation     | Toast: "Substitution assigned: {faculty} for {subject}"  |

---

## 10. Course & Curriculum Module — 8 screens

### Page 41: Course Catalog `/courses`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|118| Search + Filter Bar     | Search by code/title, filter by dept/type/credits        |
|119| Course Cards Grid       | Card: code, title, credits, type badge, prerequisites    |
|120| Course Detail Drawer    | Side drawer with full syllabus, COs, faculty assigned    |

### Page 42: Course Registration `/courses/register`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|121| Available Electives     | Cards with seat availability bar + "Register" button     |
|122| My Registered Courses   | List of confirmed + waitlisted courses                   |
|123| Registration Closed     | "Registration window closed" with dates info             |

### Page 43: Syllabus & CO Mapping `/courses/[id]/syllabus`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|124| Syllabus Viewer         | Unit-wise expandable syllabus with PDF download          |
|125| CO-PO Mapping Matrix    | Editable matrix: COs × POs with correlation levels       |

---

## 11. Faculty & HR Module — 12 screens

### Page 44: Faculty Directory `/faculty`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|126| Search + Dept Filter    | Name search, department dropdown                         |
|127| Faculty Cards / Table   | Toggle between card grid and table view                  |

### Page 45: Faculty Profile `/faculty/[id]`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|128| Profile Header          | Photo, name, designation, department, contact            |
|129| Qualifications Tab      | Degrees, certifications list                             |
|130| Publications Tab        | Papers, conferences, patents list                        |
|131| Workload Tab            | Subjects assigned, weekly hours chart                    |
|132| Leave History Tab       | Past leave applications with status                      |

### Page 46: Leave Application `/leave`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|133| Leave Form              | Leave type, date range, reason, document upload          |
|134| Leave Balance Card      | CL/EL/ML remaining balance display                       |
|135| My Leave History        | Table of past applications with status badges            |

### Page 47: Leave Approvals `/leave/approvals`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|136| Pending Queue           | Table with faculty name, type, dates, approve/reject     |
|137| Approval Detail Modal   | Full leave request details + remarks + action buttons    |

---

## 12. Library Module — 11 screens

### Page 48: Library Search `/library`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|138| Search Bar + Filters    | Full text search, category pills, availability toggle    |
|139| Book Cards Grid         | Cover thumbnail, title, author, ISBN, availability badge |
|140| Book Detail Modal       | Full details + issue history + "Reserve" CTA             |
|141| Empty Search State      | "No books match your search" + suggestion                |

### Page 49: My Books `/library/my-books`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|142| Currently Issued        | Books with due dates, "Renew" button, overdue highlight  |
|143| Past Issues History     | Previously borrowed books table                          |
|144| Fine Notification       | Inline alert showing outstanding fine amount             |

### Page 50: Library Admin `/library/manage`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|145| Issue Book Form         | Scan/enter accession no + student ID → confirm issue     |
|146| Return Book Form        | Scan/enter accession no → auto-calculate fine → confirm  |
|147| Add/Edit Book Form      | Full book details form with ISBN auto-lookup             |
|148| Overdue Report          | Table of overdue books with student details              |

---

## 13. Communication Module — 8 screens

### Page 51: Announcements `/announcements`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|149| Announcements Feed      | Card list: author, time, title, body preview, scope badge|
|150| Full Announcement View  | Expanded body, attachments, acknowledgment list          |
|151| Compose Announcement    | Modal: rich-text editor, scope selector, attach files    |
|152| Delete Confirmation     | "Delete this announcement?" dialog                       |

### Page 52: Academic Calendar `/calendar`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|153| Month Calendar View     | Calendar grid with color-coded events (exam/holiday/event)|
|154| Event Detail Popover    | Click event → popover with details                       |
|155| Add Event Modal (Admin) | Title, type, date range, description                     |
|156| List View Toggle        | Chronological list alternative to calendar grid          |

---

## 14. Reports & Analytics Module — 8 screens

### Page 53: Reports Builder `/reports`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|157| Report Type Selector    | Dropdown: Attendance, Fee, Results, Enrollment, Custom   |
|158| Filter Controls         | Date range, department, semester, branch                 |
|159| Chart / Table Preview   | Inline chart or table showing generated report data      |
|160| Export Bar              | Export PDF / Export Excel / Schedule Periodic buttons     |

### Page 54: NAAC / NBA Report Gen `/reports/accreditation`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|161| Criteria Selector       | NAAC criteria / NBA SAR section picker                   |
|162| Auto-Generated Data     | Pre-filled data from system with editable overrides      |
|163| Gap Indicator           | Missing data points highlighted in red                   |
|164| Generate Final Report   | "Generate PDF" → downloadable accreditation document     |

---

## 15. Placement Module — 10 screens

### Page 55: Placement Dashboard `/placement`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|165| Upcoming Drives         | Card list of upcoming drives with company logo + date    |
|166| My Applications         | Status tracker for applied drives                        |
|167| Eligibility Check       | "You're eligible for X out of Y drives" summary          |

### Page 56: Placement Drives `/placement/drives`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|168| Create Drive Form       | Company, date, eligibility criteria, job description     |
|169| Drive Detail View       | Full JD + eligible students list + application count     |
|170| Offer Tracking          | Students with offer status (offered/accepted/declined)   |

### Page 57: Company Database `/placement/companies`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|171| Company List            | Table: name, industry, past visits, avg package          |
|172| Add/Edit Company        | Company details form + contact person                    |
|173| Company History         | Past drives, students placed, packages offered           |
|174| Stats Overview          | Placement statistics charts (packages, counts, trends)   |

---

## 16. Hostel Module — 10 screens

### Page 58: Hostel Overview `/hostel`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|175| Room Info Card          | Block, room no, roommates, floor map link                |
|176| Mess Menu Widget        | This week's mess menu (Mon–Sun)                          |
|177| Complaint Status        | Active complaints with status badges                     |

### Page 59: Room Allocation `/hostel/rooms`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|178| Floor Plan Grid         | Visual grid: occupied (filled) / vacant (outline) rooms  |
|179| Allocate Room Modal     | Search student + assign room + confirm                   |
|180| Vacancy Summary         | Block-wise vacancy count cards                           |
|181| Bulk Allocation Upload  | CSV upload for mass room assignment                      |

### Page 60: Hostel Complaints `/hostel/complaints`
| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|182| New Complaint Form      | Category (plumbing/electrical/cleaning), description, photo |
|183| My Complaints List      | Timeline of submitted complaints with status             |
|184| Complaints Queue (Warden)| All complaints table with assign/resolve actions        |
|185| Resolve Complaint Modal | Add resolution notes + mark as resolved                  |

---

## 17. Shared Overlay Screens (cross-cutting) — 2 screens

| # | Screen                  | Description                                              |
|---|-------------------------|----------------------------------------------------------|
|186| Notification Dropdown   | Bell icon → dropdown with unread/all tabs + mark as read |
|187| Global Search Modal     | Cmd+K → search students, courses, books, faculty         |

---

## 18. Screen Count Summary

| Module                     | Pages | Screens | Multiplier |
|----------------------------|-------|---------|------------|
| Global / Shared            | 4     | 11      | 2.8×       |
| Auth                       | 5     | 9       | 1.8×       |
| Dashboards                 | 4     | 16      | 4.0×       |
| Student Information        | 5     | 16      | 3.2×       |
| Admission                  | 4     | 8       | 2.0×       |
| Attendance                 | 4     | 13      | 3.3×       |
| Examination                | 6     | 18      | 3.0×       |
| Fee & Finance              | 5     | 17      | 3.4×       |
| Timetable                  | 3     | 9       | 3.0×       |
| Course & Curriculum        | 3     | 8       | 2.7×       |
| Faculty & HR               | 4     | 12      | 3.0×       |
| Library                    | 3     | 11      | 3.7×       |
| Communication              | 2     | 8       | 4.0×       |
| Reports & Analytics        | 2     | 8       | 4.0×       |
| Placement                  | 3     | 10      | 3.3×       |
| Hostel                     | 3     | 11      | 3.7×       |
| Shared Overlays            | —     | 2       | —          |
| ─────────────────────      | ───── | ─────── | ─────────  |
| **Grand Total**            | **60**| **187** | **3.1×**   |

### By Release Phase

| Phase   | Pages | Screens | Notes                                            |
|---------|-------|---------|--------------------------------------------------|
| **MVP** | 29    | **90**  | Auth + Dashboards + Students + Attendance + Fees + Communication + Shared |
| **v1.1**| 16    | **47**  | Admission + Examination + Timetable + Courses    |
| **v1.2**| 9     | **31**  | Faculty/HR + Library + Reports                   |
| **v2.0**| 6     | **21**  | Placement + Hostel                               |

> **Key Insight:** On average, every page produces **~3.1 distinct screens**. The MVP alone requires **90 screens** across 29 pages. Plan your design sprints and component library accordingly.

---

*End of Screen Inventory*
