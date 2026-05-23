# BillBee Simple PRD v1

## 1. Product Summary

BillBee is a simplified web-based rental billing system for landlords and administrators.

The system helps landlords manage their rental properties, rooms, tenants, charges, monthly bills, manual payments, receipts, and basic reports. Administrators manage users, roles, settings, audit logs, backups, and system monitoring.

This version is intentionally scoped as a mini project. It includes enough functionality to satisfy the project requirements without becoming a large enterprise system.

## 2. Problem Statement

Small landlords often track rent, utility charges, payments, and receipts manually using spreadsheets or paper records. This causes common issues:

- Tenants may be billed incorrectly.
- Room utility charges may be split incorrectly.
- Payments and receipts may be lost or duplicated.
- Overdue balances are hard to monitor.
- There is little audit history for important actions.

BillBee provides a controlled workflow for rental billing and payment tracking while adding required academic project features such as authentication, roles, dashboard, audit logs, notifications, reports, import/export, validation, and security.

## 3. Roles

BillBee has two roles:

| Role | Purpose | Access |
|---|---|---|
| Administrator | Manages the whole system | Users, roles, settings, audit logs, backups, reports, dashboard |
| Landlord | Manages rental operations | Own properties, rooms, tenants, bills, payments, receipts, reports |

## 4. MVP Scope

### Included

- Login, registration, password reset, email verification, and MFA.
- Administrator and Landlord roles.
- Landlord dashboard.
- Administrator dashboard.
- Property, room, tenant, charge, bill, payment, and receipt management.
- Billing workflow with draft and posted bills.
- CSV import for room-level non-fixed charges.
- Manual payment recording.
- Receipt generation.
- Basic reports with PDF/Excel export.
- Audit logs.
- Notification bell and toast messages.
- Basic backup management for administrator.
- Site settings for branding, email, security, and backup basics.
- Search, filter, sort, pagination, and export on major tables.

### Excluded or Deferred

- Tenant login portal.
- Online payment gateway.
- SMS notifications unless easy to configure.
- Advanced custom report builder.
- Admin impersonation.
- Complex real-time WebSocket implementation.
- Full accounting system.
- Prorated rent.
- Mobile app.

## 5. Role Permissions

### Administrator Can

- Manage user accounts.
- Assign user roles.
- Activate, deactivate, or suspend users.
- View all system activity logs.
- Export audit logs.
- View admin dashboard statistics.
- Configure basic site settings.
- Run manual backup.
- View backup history.
- View reports across the system.

### Administrator Cannot

- Silently change landlord financial records without audit logs.
- Delete official financial records permanently.

### Landlord Can

- Manage own properties.
- Manage own rooms.
- Manage own tenants.
- Manage own charge catalog.
- Generate own bills.
- Post own bills.
- Record own payments.
- Generate own receipts.
- View own dashboard and reports.
- Export own data.
- Manage own profile and password.

### Landlord Cannot

- View other landlords' data.
- Access admin settings.
- Manage users.
- View global audit logs.
- Run backups.

## 6. Statuses

Use a small set of statuses to keep implementation simple.

| Record | Statuses |
|---|---|
| User | Pending Verification, MFA Required, Active, Inactive, Suspended |
| Property | Active, Inactive |
| Room | Active, Inactive, Maintenance |
| Tenant | Active, Moved Out, Inactive |
| Charge | Active, Inactive |
| Bill | Draft, Posted, Partially Paid, Paid, Overdue, Void |
| Payment | Recorded, Void |
| Receipt | Active, Void |
| Email | Not Sent, Pending, Sent, Failed, Resent |

## 7. Core Landlord Workflow

### 7.1 Account Setup

1. Landlord registers.
2. System sends email verification link.
3. Landlord verifies email.
4. Landlord completes MFA.
5. Account becomes Active.
6. Landlord can access rental modules.

Rules:

- Landlord cannot create rental records until email is verified, MFA is complete, and account status is Active.
- Failed login attempts are tracked.
- Account locks temporarily after 5 failed attempts.

### 7.2 Property Management

Landlord can create and manage properties.

Required fields:

- Property name.
- Property address.
- Billing day from 1 to 30.
- Status.

Rules:

- Only Active properties can be used for new rooms, tenants, and bills.
- Inactive properties stay visible for history.

### 7.3 Room Management

Landlord can create rooms under a property.

Required fields:

- Room name or number.
- Capacity.
- Monthly rent.
- Rent mode.
- Status.

Rent modes:

- Room Total Rent: rent is divided among active tenants.
- Per-Tenant Rent: each tenant has a specific rent amount.

Rules:

- Capacity must be greater than 0.
- Capacity cannot be lower than current active tenants.
- Maintenance rooms cannot accept new tenants.

### 7.4 Charge Catalog

Landlord defines charges that may be used later in billing.

Charge types:

- Fixed.
- Non-fixed.
- Tenant-specific.
- Penalty or adjustment.

Charge examples:

- Rent.
- Water.
- Electricity.
- Parking.
- Wi-Fi.
- Appliance fee.
- Late penalty.

Rules:

- Creating a charge does not automatically bill tenants.
- Fixed charges require an amount.
- Non-fixed charges are entered during bill preparation.
- Inactive charges cannot be selected for new bills.

### 7.5 Tenant and Occupancy Management

Landlord registers tenants and assigns them to rooms.

Required fields:

- Full name.
- Contact number.
- Move-in date.
- Room assignment.
- Status.

Optional fields:

- Email.
- Emergency contact.
- Notes.

Rules:

- Tenant email is used only for billing notices and receipts.
- Tenants do not log in.
- Room capacity is checked before assignment.
- Duplicate active tenant records are blocked.
- Tenant move-out requires a move-out date.
- Moved-out tenants are excluded from future billing periods.

### 7.6 Billing Preparation

1. System reminds landlord one week before property billing day.
2. Landlord opens Billing Center.
3. Landlord selects billing period, due date, and coverage.
4. System checks active properties, rooms, tenants, and duplicate bills.

Rules:

- Duplicate posted bills for the same tenant and period are blocked.
- Existing draft bills can be replaced only after confirmation.

### 7.7 CSV Import for Non-Fixed Charges

Non-fixed room-level charges, such as water and electricity, are entered through CSV.

Template contains:

- Property ID.
- Property name.
- Room ID.
- Room name.
- Active occupants.
- One amount column per active non-fixed room-level charge.

Validation:

- Missing required columns: Error.
- Unknown room: Error.
- Room not owned by landlord: Error.
- Duplicate room row: Error.
- Non-numeric amount: Error.
- Negative amount: Error.
- Blank amount: Warning.

Rules:

- Errors block bill generation.
- Warnings can continue after confirmation.
- If no non-fixed charges exist, CSV step is skipped.

### 7.8 Draft Bills

System generates draft bills per active tenant.

Bill formula:

Rent  
+ Fixed Charges  
+ Tenant-Specific Charges  
+ Tenant Share of Room-Level Non-Fixed Charges  
+ Penalties or Adjustments  
- Discounts  
- Advance Payment Coverage  
= Total Amount Due

Draft bill actions:

- View.
- Edit allowed fields.
- Add adjustment.
- Delete.
- Post.

Rules:

- Draft bills are not official.
- Imported utility shares should not be edited directly.
- Corrections should be added as adjustments or the draft should be regenerated.
- Posting requires confirmation.

### 7.9 Posted Bills

Posted bills are official billing records.

Actions:

- View.
- Send email notice.
- Resend notice.
- Download PDF.
- Print.
- Void.

Rules:

- Posted bills cannot be deleted.
- Posted bills can be voided with reason.
- Bills with recorded payments cannot be voided unless payments are voided first.
- Overdue status applies when an unpaid posted bill passes its due date.

### 7.10 Payments

Tenants pay outside the system.

Payment methods:

- Cash.
- Bank transfer.
- E-wallet.
- Other.

Landlord records payment manually.

Required fields:

- Tenant.
- Posted bill.
- Payment date.
- Amount.
- Receipt number.
- Payment method.

Rules:

- Amount must be greater than 0.
- Amount cannot exceed bill balance.
- Overpayment is blocked.
- Paid and void bills cannot receive payments.
- Receipt number must be unique.
- Incorrect payments are voided, not deleted.

### 7.11 Advance Payments

Advance payments are payments for future billing periods.

Rules:

- Advance payments cover rent and fixed charges only.
- Non-fixed charges, penalties, and adjustments are still billed later.
- Advance amount cannot exceed rent plus fixed charges for the selected future period.
- Partial advance payment is allowed.
- Advance coverage is applied once during regular bill generation.

### 7.12 Receipts

Receipts are generated from payments.

Actions:

- View.
- Download PDF.
- Print.
- Email.
- Resend email.

Rules:

- Receipt must be linked to a payment.
- Voided payment marks receipt as Void.
- Void receipts cannot be emailed as active receipts.

## 8. Administrator Workflow

### 8.1 User Management

Administrator can:

- Create users.
- Edit users.
- Assign role.
- Activate, deactivate, or suspend users.
- Reset user access status when needed.
- View login history.

Required features:

- Role-based access control.
- User status management.
- Profile/avatar support.
- Password reset.

### 8.2 Audit Logs

Administrator can view and export audit logs.

Log types:

- Authentication logs.
- CRUD transaction logs.
- Error logs.
- Access logs.

Basic filters:

- User.
- Role.
- Module.
- Action.
- Date range.

### 8.3 Site Settings

Administrator can configure:

- Site name.
- Logo.
- Theme color.
- Email settings.
- Password policy.
- Session timeout.
- MFA requirement.
- Backup schedule.
- Notification defaults.
- Maintenance mode message.

### 8.4 Backup Management

Administrator can:

- Run manual backup.
- View backup history.
- See backup success or failure status.
- Configure basic backup schedule.

Simplified requirement compliance:

- Database backup is prioritized.
- File backup can be included if file uploads are implemented.
- Full backup can be represented as downloadable compressed export if feasible.

## 9. Dashboards

### 9.1 Landlord Dashboard

Widgets:

- Total properties.
- Total rooms.
- Occupied rooms.
- Vacant rooms.
- Active tenants.
- Draft bills.
- Unpaid posted bills.
- Overdue bills.
- Payments received this month.
- Recent activities.

Quick actions:

- Add Property.
- Add Tenant.
- Generate Bills.
- Record Payment.
- View Reports.

### 9.2 Administrator Dashboard

Widgets:

- Total users.
- Active users.
- Suspended users.
- New registrations.
- Recent logins.
- Recent system activities.
- Failed login alerts.
- Backup status.
- Storage usage.

Quick actions:

- Create User.
- View Audit Logs.
- Run Backup.
- Open Settings.

## 10. Notifications and Alerts

Notification features:

- Toast messages for success and errors.
- Notification bell with unread count.
- Mark as read.
- Delete notification.

Landlord notifications:

- Billing reminder.
- Draft bills generated.
- Bill posted.
- Payment recorded.
- Receipt generated.
- Email notice failed.
- Overdue bill alert.

Administrator notifications:

- Failed login attempts.
- Account lockout.
- Backup success or failure.
- Storage warning.
- System error.

Warnings:

- Delete confirmation.
- Void confirmation.
- Bulk action impact summary.
- Session expiration warning.
- Unsaved form warning.

## 11. Reports

### Landlord Reports

- Billing Summary Report.
- Payment Collection Report.
- Outstanding Balance Report.
- Overdue Bills Report.
- Tenant List Report.
- Occupancy Report.

### Administrator Reports

- User Activity Report.
- Audit Trail Report.
- System Usage Report.
- Transaction Summary Report.

Report features:

- Date range filter.
- Status filter.
- PDF export.
- Excel export.
- Print-friendly layout.

## 12. Import and Export

Import features:

- CSV import for non-fixed billing charges.
- Optional tenant import.
- Optional user import for administrator.

Export features:

- Export tables to Excel or CSV.
- Export reports to PDF or Excel.
- Download bills as PDF.
- Download receipts as PDF.
- Export audit logs to CSV or Excel.

## 13. Data Tables

Major tables must support:

- Pagination.
- Search.
- Filters.
- Sorting.
- Export current view.

Major tables:

- Users.
- Properties.
- Rooms.
- Tenants.
- Charges.
- Bills.
- Payments.
- Receipts.
- Audit logs.
- Reports.

## 14. Form Validation and UX

All forms must support:

- Required field indicators.
- Client-side validation.
- Server-side validation.
- Inline error messages.
- Loading state on submit.
- Confirmation before leaving unsaved changes.
- Clear success or error message after submit.

Validation examples:

- Email format and uniqueness.
- Phone format.
- Date range checks.
- Number minimum and maximum.
- File type and size restrictions.

## 15. PDF and Printing

PDF outputs:

- Bill statement.
- Receipt.
- Reports.

PDF requirements:

- System logo.
- Header and footer.
- Page number.
- Generated date.
- Download option.
- Print option.
- Email option where applicable.

## 16. Security Requirements

Required security controls:

- Role-based access control.
- Password hashing.
- CSRF protection.
- Rate limiting.
- Account lockout.
- Session timeout.
- Secure validation on all forms.
- Protection against SQL injection through ORM or parameterized queries.
- Output escaping against XSS.
- Secure cookies in production.

## 17. CRUD Standards

For all major CRUD modules:

- Create shows success toast and redirects or updates list.
- Read shows detail page or drawer.
- Update shows success toast and logs changes.
- Delete uses soft delete where appropriate.
- Destructive actions require confirmation.
- Records used in billing history should not be permanently deleted.
- Admin can restore soft-deleted records where supported.

## 18. Mini Project Compliance Matrix

| Requirement Area | Simple BillBee Compliance |
|---|---|
| User Role Management | Administrator and Landlord roles with RBAC |
| Authentication System | Login, registration, email verification, MFA, password reset, lockout |
| Audit Logging | Auth, CRUD, access, and error logs with admin viewer |
| Dashboard | Separate admin and landlord dashboards with widgets |
| Notifications | Toasts, notification bell, reminders, warnings |
| Warning System | Delete, void, bulk action, login, and session warnings |
| Backup System | Admin manual backup, schedule setting, backup history |
| Import/Export | CSV billing import, table exports, report exports |
| Reporting | Landlord and admin reports with PDF/Excel export |
| PDF/Printing | Bill, receipt, and report PDFs |
| CRUD with Notifications | Success/error feedback, soft delete, audit logs |
| Form Validation | Client and server validation, inline errors |
| Data Controls | Search, filter, sort, pagination, export |
| Advanced User Management | Admin user CRUD, roles, status, login history |
| Site Settings | Branding, email, security, backup, notifications |
| Security/Performance | RBAC, CSRF, hashing, rate limits, pagination |
| Professional UI/UX | Responsive layout, empty states, loading states, accessible errors |

## 19. MVP Must-Have Checklist

### Authentication and Roles

- [ ] Register/Login/Logout.
- [ ] Email verification.
- [ ] MFA.
- [ ] Password reset.
- [ ] Account lockout.
- [ ] Admin and Landlord roles.
- [ ] Profile management with avatar.

### Landlord Operations

- [ ] Property CRUD.
- [ ] Room CRUD.
- [ ] Charge catalog CRUD.
- [ ] Tenant and occupancy management.
- [ ] Billing generation.
- [ ] CSV import for non-fixed charges.
- [ ] Draft and posted bills.
- [ ] Payment recording.
- [ ] Advance payment recording.
- [ ] Receipt generation.

### Administrator Operations

- [ ] User management.
- [ ] Role and status management.
- [ ] Audit log viewer.
- [ ] Site settings.
- [ ] Backup management.
- [ ] Admin reports.

### Shared System Features

- [ ] Dashboards.
- [ ] Notifications.
- [ ] Reports.
- [ ] PDF export.
- [ ] Excel/CSV export.
- [ ] Search/filter/sort/pagination.
- [ ] Validation and confirmation modals.
- [ ] Audit logging.

## 20. Acceptance Criteria

- Administrator can manage users and system settings.
- Landlord can manage only own rental data.
- Landlord can complete setup from property to tenant.
- Landlord can generate draft bills and post official bills.
- Duplicate posted bills for the same tenant and period are blocked.
- Landlord can record payments without allowing overpayment.
- System generates receipts from payments.
- Financial records are voided, not permanently deleted.
- Admin can view audit logs.
- Dashboards show role-appropriate statistics.
- Reports can be filtered and exported.
- Major tables have search, filters, sorting, and pagination.
- Important actions show success/error notifications.
- Forms validate both client-side and server-side.

## 21. Recommended Build Order

1. Authentication, roles, and profile management.
2. Admin user management.
3. Landlord property, room, charge, and tenant setup.
4. Billing generation and draft bills.
5. Posted bills, PDF billing statement, and email notice.
6. Payment recording and receipts.
7. Dashboards and notifications.
8. Reports and exports.
9. Audit logs and admin settings.
10. Backup management and final UI polish.

## 22. Implementation Stack and Tool Map

This stack is scoped for the simplified mini-project version of BillBee. Required tools support actual product features. Optional development tools should be installed only if they are needed during debugging or performance checks.

### Existing Core Stack

| Tool | Purpose in BillBee |
|---|---|
| Laravel 13 | Main backend framework |
| PHP 8.5 | Backend runtime |
| PostgreSQL | Main relational database |
| Inertia.js v3 | SPA-style Laravel frontend bridge |
| React 19 | Frontend UI framework |
| Tailwind CSS v4 | Utility-first UI styling |
| Laravel Fortify | Authentication backend features |
| Laravel Wayfinder | Typed frontend route/action helpers |
| Pest 4 | Automated testing |

### Laravel Built-In Features

| Laravel Feature | Purpose in BillBee |
|---|---|
| Eloquent ORM | Models, relationships, and database access |
| Migrations | Versioned database schema |
| Form Requests | Server-side validation |
| Policies and Gates | Role and ownership authorization |
| Notifications | In-app and email notifications |
| Mail | Billing notices, receipt emails, and system emails |
| Queues | Background jobs for emails, notifications, reports, and backups |
| Scheduler | Billing reminders, overdue checks, and backup schedules |
| Filesystem | Avatar uploads, proof-of-payment uploads, reports, and backups |

### Required Supporting Packages

| Package | Purpose in BillBee | Requirement Supported |
|---|---|---|
| `maatwebsite/excel` | CSV/Excel import and export | Import/export, reports, data exports |
| `barryvdh/laravel-dompdf` | Generate PDF bills, receipts, and reports | PDF generation and printing |
| `spatie/laravel-activitylog` | Track user actions and model changes | Audit logging and transaction tracking |
| `spatie/laravel-backup` | Create and manage backups | Automated backup requirement |
| `predis/predis` | Redis client for queues/cache if Redis is used | Queues, notifications, performance |
| `laravel/scout` | Search layer for major records | Advanced data controls and global search |

Recommended installation commands:

```bash
composer require maatwebsite/excel
composer require barryvdh/laravel-dompdf
composer require spatie/laravel-activitylog
composer require spatie/laravel-backup
composer require predis/predis
composer require laravel/scout
```

### Optional Development and QA Tools

These tools are not required for the final MVP. Use them only if debugging, query inspection, or development monitoring becomes necessary.

| Package | Purpose | Production Required? |
|---|---|---|
| `laravel/telescope` | Inspect requests, jobs, mail, notifications, exceptions, logs, and queries during development | No |
| `barryvdh/laravel-debugbar` | Inspect local page performance, queries, routes, and request data | No |
| `beyondcode/laravel-query-detector` | Detect N+1 query issues during development | No |

Optional installation commands:

```bash
composer require --dev laravel/telescope
composer require --dev barryvdh/laravel-debugbar
composer require --dev beyondcode/laravel-query-detector
```

### Stack Decision Notes

- Redis is included because BillBee uses queues, notifications, scheduled jobs, and dashboard data that may benefit from caching/background processing.
- Laravel Scout is included because the project requires advanced data controls and BillBee has many searchable records, including tenants, bills, payments, receipts, rooms, and properties.
- Telescope, Debugbar, and Query Detector are optional because they support development quality but are not product features.
- AI packages, Google API clients, Meilisearch, Horizon, and additional auditing packages are excluded from the MVP unless a specific implementation need appears.
