# BillBee System Workflow

## Workflow Guardrails

The workflow should stay simple, but the UI must prevent invalid billing and payment records.

### Core Status Rules

| Record | Allowed Statuses | Important Rule |
|---|---|---|
| Landlord account | Pending Verification, MFA Required, Active, Suspended | Only Active landlords can create or manage rental records |
| Property | Active, Inactive, Archived | Only Active properties are available for new rooms, tenants, and bill generation |
| Room | Active, Inactive, Maintenance | Only Active rooms with active tenants are billable |
| Tenant | Active, Moved Out, Inactive | Only Active tenants assigned to a room are included in bill generation |
| Charge | Active, Inactive | Only Active charges are selectable for new billing setup |
| Bill | Draft, Posted, Partially Paid, Paid, Overdue, Void | Posted bills are official and cannot be deleted |
| Payment | Recorded, Void | Incorrect payments are voided, not deleted |
| Receipt | Active, Void | Receipts follow the payment status |

### Access Rules

The initial workflow assumes a landlord-only system.

If staff users are added later, restrict these actions to authorized users only:

- Posting bills
- Voiding posted bills
- Recording payments
- Voiding payments
- Sending bulk email notices
- Changing tenant occupancy records

### Required Confirmation Rules

The system should ask for confirmation before:

- Deleting a draft bill
- Posting a draft bill
- Replacing existing draft bills during regeneration
- Voiding a posted bill
- Recording a regular payment
- Recording an advance payment
- Voiding a payment

### Audit Log Rules

The system records an audit log for:

- Property, room, charge, and tenant creation or update
- Tenant move-out or room transfer
- CSV import confirmation
- Draft bill generation, deletion, regeneration, and posting
- Posted bill voiding
- Email notice sending or resending
- Payment recording or voiding
- Receipt email sending or resending

---

## 1. Landlord Account Setup

1. Landlord registers for an account.
2. System sends email verification link.
3. Landlord verifies email address.
4. Landlord sets up mandatory MFA.
5. System checks account status.

Landlord cannot create properties until:

- Email verified = Yes
- MFA setup = Complete
- Account status = Active

Once verified, landlord can access the main rental management modules.

Error states:

- Verification link expired
- Email already registered
- MFA setup incomplete
- Account suspended

If any requirement is incomplete, the UI should show a clear blocked-state message and the next required action.

---

## 2. Property Creation Workflow

1. Landlord opens Properties.
2. Landlord clicks Create Property.
3. Landlord enters property details:
   - Property name, required
   - Property address, required
   - Description
   - Contact details, optional
   - Status, required
4. Landlord selects the property’s recurring billing day:
   - Day 1 to 30 of each month
5. System validates the required fields.
6. System saves the property.
7. System records the action in the audit log.
8. Property becomes available for room, charge, and tenant setup.

Validation rules:

- Property name is required
- Property address is required
- Billing day must be from 1 to 30
- Status must be Active or Inactive
- Archived properties cannot be used for new rooms, tenants, charges, or bill generation

Empty state:

- If no property exists, show Create Property as the primary action.

Example:

Property: Sunset Apartments  
Billing Day: Every 15th of the month

---

## 3. Property Charge Catalog Workflow

Property charges are not automatic bill items yet. They are only a catalog of possible charges that may be used later for rooms, tenants, or bills.

1. Landlord opens the property’s Charge Catalog.
2. System shows predefined charge categories:
   - Water
   - Electricity
   - Gadgets
   - Appliances
   - Parking
   - Other
3. Landlord adds available charges for the property.
4. For each charge, landlord defines:
   - Charge name, required
   - Category, required
   - Charge type, required
   - Charge scope, required
   - Amount, required if fixed
   - Status, required
   - Notes, optional

### Charge Types

| Charge Type | Meaning | Example |
|---|---|---|
| Fixed | Amount is known in advance and usually constant per billing period | Parking fee ₱500 |
| Non-fixed | Amount is not known until billing preparation | Water, electricity |
| Tenant-specific | Applies only to a selected tenant | Laptop fee ₱100 |
| Additional / Penalty | Added during bill preparation | Late penalty ₱200 |

### Charge Scopes

| Charge Scope | Meaning | Example |
|---|---|---|
| Room-level | Amount is entered per room and divided among active tenants | Water, electricity |
| Tenant-level | Amount applies directly to one tenant | Parking fee, gadget fee |
| Bill adjustment | Amount is added only during draft bill review | One-time penalty or correction |

Example charge catalog:

| Charge | Type | Amount |
|---|---|---|
| Water | Non-fixed | No amount yet |
| Electricity | Non-fixed | No amount yet |
| Parking Fee | Fixed | ₱500 |
| Wi-Fi Fee | Fixed | ₱200 |
| Pet Fee | Fixed or custom | ₱200 |

Important rule:

Creating a charge in the property catalog does not automatically charge tenants. It only makes that charge available for selection later.

Validation rules:

- Charge name is required
- Category is required
- Charge type is required
- Charge scope is required
- Fixed charges require an amount greater than or equal to 0
- Non-fixed room-level charges do not require an amount during catalog setup
- Duplicate active charge names should be blocked within the same property
- Inactive charges remain visible in historical bills but cannot be selected for new billing setup

Empty state:

- If no charges exist, show Add Charge as the primary action and explain that charges must be configured before tenant billing setup.

---

## 4. Room Creation Workflow

1. Landlord opens the selected property.
2. Landlord creates rooms under that property.
3. For each room, landlord enters:
   - Room name or number, required
   - Capacity, required
   - Monthly rent, required
   - Rent mode, required
   - Room status, required
   - Notes, optional

### Rent Mode Options

| Rent Mode | Meaning | Example |
|---|---|---|
| Room Total Rent | Rent is for the whole room and is split equally among active tenants | Room rent ₱6,000 / 3 tenants = ₱2,000 each |
| Per-Tenant Rent | Each tenant has an individual rent amount | Tenant A ₱3,000, Tenant B ₱3,500 |

4. System validates capacity, rent amount, rent mode, and status.
5. System saves the room.
6. System records the action in the audit log.

Validation rules:

- Room name or number is required
- Room name or number must be unique within the property
- Capacity must be greater than 0
- Capacity cannot be reduced below the number of active tenants assigned to the room
- Monthly rent must be greater than or equal to 0
- Rent mode is required
- Inactive or Maintenance rooms cannot receive new tenant assignments

Empty state:

- If a property has no rooms, show Add Room as the primary action.

Example:

Room: A-101  
Capacity: 2  
Monthly Rent: ₱6,000  
Rent Mode: Room Total Rent  
Tenant Rent Share: ₱3,000 each if 2 tenants are active

---

## 5. Tenant Registration and Occupancy Workflow

Tenants do not have login accounts. They are stored as records only.

1. Landlord opens Tenants & Occupancy.
2. Landlord selects:
   - Property
   - Room
3. System checks if the room is Active and still has available capacity.
4. Landlord enters tenant information:
   - Full name, required
   - Email address, optional but required for bill or receipt email
   - Contact number, required
   - Emergency contact
   - Move-in date, required
   - Status, required
5. System checks whether the same tenant already exists in any property owned by the landlord.
6. If room capacity and duplicate checks pass, landlord continues to billing setup for the tenant.

Validation rules:

- Full name is required
- Contact number is required
- Move-in date is required
- Room must be Active
- Room must have available capacity
- Duplicate active tenant records should be blocked when the same landlord, full name, and contact details match
- Tenant status must be Active, Moved Out, or Inactive

### Tenant Billing Setup

Landlord selects applicable charges from the property charge catalog.

Examples:

| Charge | Source |
|---|---|
| Parking Fee | Property charge catalog |
| Water | Property charge catalog |
| Electricity | Property charge catalog |
| Wi-Fi Fee | Property charge catalog |

Landlord may also add tenant-specific charges not listed in the catalog.

Examples:

| Tenant-Specific Charge | Amount |
|---|---|
| Phone gadget fee | ₱50 |
| Laptop gadget fee | ₱100 |
| Refrigerator appliance fee | ₱500 |
| Pet fee | ₱200 |

7. System saves tenant record and assignment.
8. System updates room occupancy.
9. System records the action in the audit log.

Important rule:

Tenant email is used only for sending billing notices and receipts. The tenant does not log in to BillBee.

### Tenant Move-Out Workflow

1. Landlord opens Tenants & Occupancy.
2. Landlord selects an active tenant.
3. Landlord clicks Move Out.
4. Landlord enters:
   - Move-out date, required
   - Move-out reason, optional
   - Notes, optional
5. System checks for unpaid posted bills.
6. System shows a confirmation message.
7. System marks the tenant as Moved Out from the effective date.
8. System updates room occupancy.
9. System records the action in the audit log.

Move-out rules:

- Move-out date cannot be earlier than move-in date
- Moved Out tenants are not included in future billing periods
- Existing posted bills remain payable
- If the tenant has unpaid posted bills, move-out is allowed but the UI must clearly show the unpaid balance warning

### Tenant Room Transfer Workflow

1. Landlord opens Tenants & Occupancy.
2. Landlord selects an active tenant.
3. Landlord clicks Transfer Room.
4. Landlord selects a new Active room.
5. Landlord enters transfer effective date.
6. System checks the new room capacity.
7. System saves the new assignment and closes the old assignment from the effective date.
8. System records the action in the audit log.

Transfer rules:

- New room must be Active
- New room must have available capacity
- Transfer date cannot be earlier than the tenant move-in date
- Billing uses the tenant assignment that is active for the selected billing period

Billing eligibility rule:

For a billing period, the system includes tenants whose assignment is active during that billing period and excludes tenants moved out before the billing period starts. Prorated rent is not included in the initial workflow unless added later as a separate business rule.

Empty state:

- If there are no tenants, show Add Tenant as the primary action.

---

## 6. Billing Preparation Reminder Workflow

1. Each property has a configured billing day.
2. One week before the billing day, the system notifies the landlord.
3. Notification is sent through:
   - In-app notification
   - Email notification
4. Notification reminds the landlord to prepare bills.

Example:

Billing day: 15th of the month  
Reminder sent: 8th of the month  
Message: Start preparing March 2026 bills for Sunset Apartments.

---

## 7. Billing Center Workflow

Billing Center manages the full bill generation process.

Recommended bill lifecycle:

Draft → Posted → Partially Paid / Paid / Overdue / Void

No For Approval status is used.

Billing Center tabs:

Draft | Posted

Status rules:

- Draft bills are editable and can be deleted before posting
- Posted bills are official and cannot be deleted
- Paid and Partially Paid are payment states of posted bills
- Overdue applies to posted bills with unpaid balance after the due date
- Void bills stay visible for audit history but are excluded from active receivables

Empty state:

- If no bills exist, show Generate Billings as the primary action.

---

## 8. Generate Billings Workflow

1. Landlord opens Billing Center.
2. Landlord clicks Generate Billings.
3. System opens a right-side sliding drawer.

The drawer contains four steps:

1. Billing Setup
2. Download Template
3. Upload & Review
4. Generate Drafts

---

### Step 1: Billing Setup

Landlord selects:

| Field | Purpose |
|---|---|
| Billing Period | Month being billed |
| Billing Type | Usually Monthly |
| Due Date | Payment due date |
| Coverage | All properties or selected property |
| Notes | Optional internal notes |

System validates:

- Billing period is selected
- Due date is selected
- Due date is valid
- Landlord has active tenants under the selected coverage
- Selected coverage has Active properties and Active rooms
- No posted bill already exists for the same tenant and billing period

Duplicate billing rule:

- If posted bills already exist for the selected coverage and billing period, the system blocks generation for those tenants.
- If draft bills already exist for the selected coverage and billing period, the system shows a conflict summary.
- Landlord may cancel generation or replace existing draft bills after confirmation.
- Replacing drafts deletes and regenerates only draft bills. Posted bills are never replaced.

Then landlord proceeds to the CSV template step.

---

### Step 2: Download Non-Fixed Charge CSV Template

This step is for non-fixed room-level charges, such as water or electricity.

1. System generates one CSV template.
2. The CSV contains all applicable active rooms under the selected coverage.
3. Each row represents one room, regardless of property.
4. Editable amount columns are generated from the selected properties' Active non-fixed room-level charges.
5. Landlord downloads the CSV.

CSV template columns:

| Column | Editable? | Purpose |
|---|---|---|
| property_id | No | System reference |
| property_name | No | Landlord reference |
| room_id | No | System reference |
| room_name | No | Landlord reference |
| active_occupants | No | Used to divide charges |
| charge_amount columns | Yes | One column per Active non-fixed room-level charge |

Important rule:

The CSV contains actual amount to be paid, not meter readings.

If the selected coverage has no Active non-fixed room-level charges:

- System skips the CSV upload requirement.
- Landlord can proceed directly to Generate Draft Bills.

Example:

| Property | Room | Occupants | Water Amount | Electricity Amount |
|---|---|---:|---:|---:|
| Sunset Apartments | A-101 | 2 | ₱300 | ₱800 |
| Sunset Apartments | A-102 | 1 | ₱200 | ₱450 |
| Greenview | B-201 | 3 | ₱600 | ₱1,200 |

---

### Step 3: Upload and Review CSV

1. Landlord fills in non-fixed charge amounts outside the system.
2. Landlord uploads the completed CSV.
3. System validates the file.

Validation checks:

| Check | Result |
|---|---|
| Required columns missing | Error |
| Room does not exist | Error |
| Room does not belong to landlord | Error |
| Duplicate room row | Error |
| Amount is non-numeric | Error |
| Amount is negative | Error |
| Required amount is blank | Warning |
| Room has no active tenants | Warning |
| Charge column not recognized | Error |
| CSV template is stale | Warning or Error |

Stale template rule:

- If tenants, rooms, or charge columns changed after download, the system warns the landlord.
- If the uploaded CSV references removed rooms or unrecognized charge columns, the system treats it as an error.
- If only occupant counts changed, the system recalculates using current active occupants and shows a warning.

After validation, system shows review summary:

| Summary | Example |
|---|---:|
| Total Rooms | 24 |
| Valid Rows | 20 |
| Warnings | 3 |
| Errors | 1 |

System also shows a review table:

| Property | Room | Occupants | Water | Electricity | Computed Share | Status |
|---|---|---:|---:|---:|---|---|
| Sunset Apartments | A-101 | 2 | ₱300 | ₱800 | ₱150 water + ₱400 electricity each | Valid |
| Sunset Apartments | A-102 | 1 | ₱200 | blank | Electricity ₱0 if confirmed | Warning |
| Greenview | B-201 | 0 | ₱400 | ₱600 | — | Warning |

If there are errors:

- System blocks bill generation until errors are fixed.

If there are warnings:

- System allows landlord to continue after confirmation.

When confirmed:

1. System records room-level non-fixed charges for the billing period.
2. These values become available for bill calculation.
3. System records the import confirmation in the audit log.

---

### Step 4: Generate Draft Bills

After successful CSV import, system prepares draft bill calculation.

Before creating draft bills, system re-checks:

- Tenant is Active for the billing period
- Property is Active
- Room is Active
- Charge is Active or already attached to the tenant billing setup
- No posted bill exists for the same tenant and billing period
- Existing draft bills are replaced only if landlord confirmed replacement

For each active tenant, system computes:

Rent  
+ Fixed Charges  
+ Tenant-Specific Charges  
+ Tenant Share of Room-Level Non-Fixed Charges  
+ Additional Charges / Penalties  
- Discounts  
- Advance Payment Coverage  
= Total Amount Due

### Non-Fixed Charge Sharing

Room-level non-fixed charges are divided among active tenants in the room.

Example:

Room A-101 has 2 tenants.

| Room Charge | Room Amount | Tenant Share |
|---|---:|---:|
| Water | ₱300 | ₱150 each |
| Electricity | ₱800 | ₱400 each |

Each tenant receives:

Water: ₱150  
Electricity: ₱400

### Advance Payment Coverage

If tenant already paid rent and fixed charges in advance for this billing period:

1. Rent and fixed charges appear as covered.
2. Non-fixed charges may still appear.
3. Additional charges and penalties may still appear.
4. If no remaining charges exist, the regular bill total may be ₱0.

Example:

Rent + fixed charges already paid in advance

Water share: ₱150  
Electricity share: ₱400  
Total amount due: ₱550

Then landlord clicks Generate Draft Bills.

System creates draft bills and redirects landlord to the Draft tab.

Draft regeneration rule:

- Draft bills may be regenerated only while they are still Draft.
- Regeneration requires confirmation if existing drafts will be replaced.
- Posted bills cannot be regenerated or replaced.
- If non-fixed charge values need correction after drafts are created, landlord should correct the CSV import and regenerate drafts, or add a separate adjustment line if the bill-specific correction is intentional.

---

## 9. Draft Bills Workflow

Draft bills are editable and not yet final.

In the Draft tab, landlord can:

| Action | Purpose |
|---|---|
| View | Review full bill details |
| Edit | Adjust due date, notes, penalties, discounts, or additional charges |
| Delete | Remove draft bill |
| Post | Finalize bill |

Draft editing rules:

- Imported room-level non-fixed charge shares should not be directly edited inside one tenant bill.
- If adjustment is needed, record it as an additional charge, discount, or correction.
- Adjustment lines require a label, amount, and reason.
- Total amount due cannot be negative.
- Delete requires confirmation.
- Post requires confirmation.

If imported room-level charge values are wrong, the preferred correction is to fix the non-fixed charge import and regenerate the affected draft bills before posting.

When landlord posts a bill:

1. System finalizes the bill.
2. Bill moves to Posted tab.
3. Invoice number becomes final.
4. Bill becomes ready for email notice and payment recording.
5. System records audit log.

Posting rules:

- Bill must have a valid due date.
- Bill must have at least one bill line or a clear zero-balance reason.
- Posted bill totals are locked.
- Posted bills can only be corrected by voiding and regenerating/reposting, or by posting an adjustment in a later bill.

---

## 10. Posted Bills Workflow

Posted bills are official billing records.

In the Posted tab, landlord can:

| Action | Purpose |
|---|---|
| View | View final billing details |
| Send Email Notice | Send bill to tenant email |
| Resend Email Notice | Resend failed or previous notice |
| Download PDF | Download billing statement |
| Print | Print billing statement |
| Void | Cancel official bill while keeping record |

Use Void, not Delete, for posted bills.

Void rules:

- Void requires confirmation.
- Void requires a reason.
- Bills with recorded payments cannot be voided until the related payments are voided first.
- Void bills remain visible in history and audit logs.
- Void bills are excluded from active receivables, payment selection, overdue counts, and email notice bulk actions.

Overdue rule:

- A posted bill with unpaid balance is considered Overdue after the due date.
- Overdue can be computed from due date and balance; it does not need a manual status change.

### Email Notice Workflow

1. Landlord sends notice to one tenant, selected tenants, or all not-sent bills.
2. System sends billing statement to tenant email.
3. System records email delivery status.

Email statuses:

| Status | Meaning |
|---|---|
| Not Sent | No notice sent yet |
| Pending | Email is being sent |
| Sent | Email sent successfully |
| Failed | Email failed |
| Resent | Email resent |

Email notice rules:

- Bill must be Posted and not Void.
- Tenant must have a valid email address.
- If email is missing, the UI should block sending and show the missing email message.
- Bulk Send should skip Paid, Void, and email Pending bills unless explicitly selected.
- System should show last sent date and latest delivery status.

---

## 11. Tenant Payment Workflow

Tenants pay outside the system through:

- Cash
- Bank transfer
- E-wallet
- Other method

Tenant does not pay inside BillBee.

After payment, landlord records the payment manually.

---

## 12. Regular Payment Recording Workflow

1. Landlord opens Payments & Receipts.
2. Landlord clicks Record Payment.
3. System opens a right-side drawer.
4. Landlord selects:
   - Tenant
   - Posted bill
   - Date of payment
   - Amount
   - Receipt number
   - Mode of payment
   - Reference number, optional
   - Notes, optional
   - Proof of payment upload, optional

System shows bill summary:

| Field | Example |
|---|---|
| Bill # | BILL-2026-00013 |
| Billing Period | March 2026 |
| Total Amount | ₱12,945 |
| Amount Paid | ₱5,000 |
| Current Balance | ₱7,945 |
| Due Date | March 15, 2026 |
| Payment Status | Partially Paid |

System validates amount.

Payment rules:

| Payment Amount | Result |
|---|---|
| Less than balance | Bill becomes Partially Paid |
| Equal to balance | Bill becomes Paid |
| Greater than balance | Blocked |

Additional validation rules:

- Payment amount must be greater than 0
- Selected bill must be Posted, Partially Paid, or Overdue
- Selected bill must not be Paid or Void
- Payment date is required
- Receipt number is required and must be unique for the landlord
- Mode of payment is required
- Proof of payment is optional

Overpayment rule:

BillBee does not support overpayment credits.

If payment amount exceeds selected bill balance, system blocks saving.

Suggested message:

Payment amount exceeds the selected bill balance. BillBee does not support overpayment credits. Record the excess as an advance payment for a future billing period.

After valid payment:

1. System records payment.
2. System applies payment to posted bill.
3. System updates bill balance.
4. System updates payment status.
5. System generates receipt.
6. System updates reports and dashboard.
7. System records audit log.

Receipt actions:

- View Receipt
- Download PDF
- Print
- Email to Tenant

### Payment Correction Workflow

Payments are not edited or deleted after recording.

If a payment was recorded incorrectly:

1. Landlord opens the payment or receipt record.
2. Landlord clicks Void Payment.
3. Landlord enters a void reason.
4. System shows a confirmation message.
5. System marks the payment as Void.
6. System marks the linked receipt as Void.
7. System restores the bill balance.
8. System recalculates the bill payment status.
9. System records the action in the audit log.

Void payment rules:

- Void requires a reason.
- Void payments remain visible in history.
- Voided receipts must show a clear Void label.
- A voided payment cannot be voided again.

---

## 13. Advance Payment Workflow

Advance payments are separate from regular bill payments.

An advance payment is a payment for a future billing period before the regular bill exists.

1. Landlord opens Payments & Receipts.
2. Landlord clicks Record Advance Payment.
3. System opens a right-side drawer.
4. Landlord selects:
   - Tenant
   - Future billing period
   - Date of payment
   - Amount
   - Receipt number
   - Mode of payment
   - Reference number, optional
   - Notes, optional

System calculates:

Monthly Rent  
+ Fixed Charges  
= Advance Bill Amount

Advance payment covers:

- Rent + fixed charges only

It does not automatically cover:

- Non-fixed charges
- Additional charges
- Penalties

Advance payment rules:

- Future billing period is required.
- Amount must be greater than 0.
- Receipt number is required and must be unique for the landlord.
- Advance payment can be partial or full.
- Total advance coverage for the tenant and future period cannot exceed monthly rent plus fixed charges.
- If the future period is already fully advance paid, the system blocks another advance payment for that same period.
- If the tenant is moved out before the future billing period starts, the system blocks advance payment for that period.

After saving:

1. System generates an Advance Bill for the future month.
2. System records the payment.
3. System generates a receipt.
4. Future billing period is marked as Advance Paid for that tenant.

Later, during regular bill generation for that future month:

1. System still generates a regular bill.
2. Rent and fixed charges appear as already covered.
3. Non-fixed charges are still billed.
4. Additional charges and penalties may still be billed.
5. If there are no remaining charges, total due may be ₱0.

Advance application rules:

- Advance coverage is applied only once.
- If advance payment was partial, the remaining rent and fixed charge balance is included in the regular bill.
- If advance payment was full, rent and fixed charges appear as covered.
- Non-fixed charges, additional charges, and penalties are still billed.
- The regular bill should show the advance coverage line clearly so the landlord can verify why rent or fixed charges are reduced.

---

## 14. Receipt Workflow

Receipts are not a separate main workflow. They are generated from payments.

For every regular payment or advance payment:

1. System generates receipt.
2. Receipt is linked to the payment.
3. Landlord can:
   - View receipt
   - Download PDF
   - Print
   - Email to tenant
   - Resend receipt email if failed

Receipt email statuses:

| Status | Meaning |
|---|---|
| Not Sent | Receipt not emailed |
| Sent | Receipt emailed successfully |
| Failed | Receipt email failed |
| Resent | Receipt email resent |

Receipt rules:

- Receipt number must be unique for the landlord.
- Receipt is generated only from a recorded regular payment or advance payment.
- Receipt cannot exist without a linked payment.
- If payment is voided, receipt is marked Void and remains visible for history.
- Void receipts cannot be emailed as active receipts.

---

## 15. Empty, Error, and Confirmation States

Each main screen should have simple states that prevent confusion.

| Area | Empty State | Blocking Error State | Confirmation State |
|---|---|---|---|
| Properties | No properties yet. Create your first property. | Missing required property fields | Archive or status change if property has records |
| Charge Catalog | No charges yet. Add charges before tenant billing setup. | Fixed charge has no amount | Deactivate charge |
| Rooms | No rooms yet. Add rooms before registering tenants. | Capacity below active tenants | Change status to Inactive or Maintenance |
| Tenants & Occupancy | No tenants yet. Add a tenant to a room. | Room full or inactive | Move out or transfer tenant |
| Billing Center | No bills yet. Generate billings. | Duplicate posted bills exist for period | Replace existing draft bills |
| CSV Upload | No non-fixed charges. Skip CSV step. | Missing columns, invalid room, invalid amount | Continue with warnings |
| Draft Bills | No draft bills for selected period. | Negative total or missing due date | Delete or post draft bill |
| Posted Bills | No posted bills for selected period. | Cannot void bill with payments | Void bill |
| Payments & Receipts | No payments yet. Record a payment. | Overpayment or paid/void bill selected | Record or void payment |
| Receipts | No receipts yet. Receipts generate from payments. | Receipt has no linked payment | Email receipt |

---

## 16. End-to-End Workflow Summary

Use this as the concise final version:

1. Landlord verifies email and sets up MFA.
2. Landlord creates a property and sets its monthly billing day.
3. Landlord creates the property charge catalog.
4. Charges are defined as fixed or non-fixed.
5. Landlord creates rooms under the property.
6. Landlord sets room capacity, rent amount, and rent mode.
7. Landlord registers tenants into rooms.
8. System validates room capacity and duplicate tenant records.
9. Landlord selects applicable charges for each tenant.
10. Landlord adds tenant-specific charges if needed.
11. Landlord moves out or transfers tenants when occupancy changes.
12. One week before billing day, system reminds landlord to prepare bills.
13. Landlord opens Billing Center and clicks Generate Billings.
14. Landlord selects billing period, due date, and coverage.
15. System checks active tenants, active rooms, duplicate bills, and existing drafts.
16. System generates CSV template for active room-level non-fixed charges, or skips CSV if none exist.
17. Landlord inputs actual non-fixed charge amounts per room.
18. Landlord uploads completed CSV.
19. System validates and shows import review.
20. Landlord fixes errors or confirms warnings.
21. System records room-level non-fixed charges.
22. System divides room-level non-fixed charges among eligible active tenants.
23. System calculates tenant bills.
24. System applies advance payment coverage if applicable.
25. System generates draft bills.
26. Landlord reviews, edits allowed fields, adds adjustments, deletes drafts, regenerates drafts, or posts drafts.
27. Posted bills become official and locked.
28. Landlord sends email notices to tenants.
29. Tenant pays outside the system.
30. Landlord records regular payment or advance payment.
31. System updates balance and payment status.
32. System generates receipt.
33. Landlord downloads, prints, or emails receipt.
34. If a payment is wrong, landlord voids the payment with a reason.
35. If an official bill must be cancelled, landlord voids the posted bill with a reason and only if no payments are recorded.
36. System updates dashboard, reports, notifications, and audit logs.

This workflow keeps the system coherent:

setup → occupancy → charge catalog → billing preparation → draft bills → posted bills → payment recording → receipt generation → corrections through voiding
