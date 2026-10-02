# Security Specification: MedControl Doctor

## 1. Data Invariants
- **Sole Doctor / Admin Control**: Only authenticated, email-verified medical administrators can read, list, create, update, or delete patients.
- **PII Protection**: Patient names, phone numbers, medical diagnoses, and medication amounts are clinical Personally Identifiable Information (PII) and must never be exposed to unauthenticated users or public reads.
- **Patient ID Integrity**: `registrationId` must be non-empty, alphanumeric with dashes/underscores (`^[a-zA-Z0-9_\-]+$`), and cannot exceed 64 characters.
- **Dosage Number Invariant**: `medicationAmount` must be a strictly positive number (`amount > 0`).
- **Relational Integrity**: A `DosageLog` in subcollection `/patients/{patientId}/dosageLogs/{dosageLogId}` must reference an existing patient and inherit authorization from the doctor owning the patient record.
- **Doctor Ownership**: Every patient record must have `doctorId == request.auth.uid`.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Unauthenticated Read Attack**: Anonymous user attempting `get /patients/pat-001` -> MUST FAIL with PERMISSION_DENIED.
2. **Unauthenticated List Attack**: Public client querying `collection('patients')` -> MUST FAIL with PERMISSION_DENIED.
3. **Spoofed Doctor Write**: Authenticated user trying to write with `doctorId != request.auth.uid` -> MUST FAIL with PERMISSION_DENIED.
4. **Negative Medication Amount**: Injection of `medicationAmount: -100` -> MUST FAIL with validation error.
5. **Zero Medication Dosage**: Attempting `medicationAmount: 0` -> MUST FAIL with validation error.
6. **Ghost Key Injection**: Payload with ghost field `isAdmin: true` inside patient document -> MUST FAIL with strict key enforcement.
7. **Oversized String Buffer**: Attempting `firstName` > 100 characters to trigger denial-of-wallet -> MUST FAIL.
8. **Malicious ID Poisoning**: Document ID with path traversal or > 128 characters -> MUST FAIL.
9. **Unverified Email Doctor**: User with `email_verified == false` attempting patient writes -> MUST FAIL.
10. **Tampered Doctor ID Update**: Updating an existing patient and trying to switch `doctorId` to another user -> MUST FAIL.
11. **Orphaned Dosage Log**: Creating a dosage log under a non-existent patient ID -> MUST FAIL.
12. **Self-Promoted Admin Document**: Non-admin attempting to create an entry in `/admins/{uid}` -> MUST FAIL.

## 3. Test Runner Invariant Checks
All tests ensure that read and write attempts lacking proper doctor authentication, valid schema constraints, or matching doctor ownership return `PERMISSION_DENIED`.
