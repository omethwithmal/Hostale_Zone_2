# Fee & Payment Management API

This document covers the full backend API for the Fee and Payment Management module in `Backend/Payment`.

Route prefix:

```text
http://localhost:5000/api/payments
```

Related existing auth prefix:

```text
http://localhost:5000/api/auth
```

## 1. Postman Setup

Create these Postman variables first:

```text
baseUrl = http://localhost:5000
token = <JWT token after login>
studentId = <MongoDB student _id>
billId = <MongoDB bill _id>
paymentId = <MongoDB payment _id>
billMonth = 2026-04
```

Use this header for all protected requests:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

## 2. Useful Existing Auth Endpoints

These are not inside the payment module, but you will need them while testing payment APIs.

### 2.1 Login

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "student1@gmail.com",
  "password": "123456"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "67f7f4c9f0b0f1d7d4db1001",
    "itNumber": "IT2023001",
    "fullName": "Nimal Perera",
    "email": "student1@gmail.com",
    "roomNumber": "A-101",
    "block": "A",
    "userType": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.2 Get All Users

```http
GET {{baseUrl}}/api/auth/users
```

Use this to get `studentId` values for admin-side payment testing.

### 2.3 Get Logged-in User Profile

```http
GET {{baseUrl}}/api/auth/profile
```

Use this to confirm the logged-in student and room details.

## 3. Important Rules in This Module

- `billMonth` format must be `YYYY-MM`
- supported payment methods: `Card`, `Online`, `Cash Deposit`
- student payment flow only allows the current month bill
- student payment amount must match the full current outstanding amount
- overdue bills can trigger late fee automatically
- OTP verification is required before a payment request becomes admin-reviewable
- admin can `accept`, `reject`, or `cancel` payment requests
- if payment is accepted, the student gets an email
- if a bill becomes overdue, cron can send overdue reminder emails
- report endpoint supports JSON and CSV output

## 4. Recommended Postman Test Flow

1. Login as admin and store `token`
2. Get a student id from `GET /api/auth/users`
3. Preview price calculation for the student
4. Create or update the student fee profile
5. Generate the monthly bill
6. View student bills and copy the `billId`
7. Login as the student
8. Initiate a payment for the current month bill
9. Check the OTP from email or transport log
10. Verify the OTP
11. Login as admin again
12. Review and accept the payment
13. Check student summary and admin outstanding reports

## 5. Payment API Endpoints

---

## 5.1 Preview Student Pricing

Preview the calculated price before saving a fee profile.

```http
POST {{baseUrl}}/api/payments/preview
```

Access:

- admin: any student
- student: only own record

Body example:

```json
{
  "studentId": "{{studentId}}",
  "roomNumber": "A-101",
  "block": "A",
  "currentBill": 3500,
  "waterBill": 1200,
  "additionalFees": [
    { "label": "Maintenance Fee", "amount": 500 },
    { "label": "Security Fee", "amount": 750 }
  ],
  "lateFeeType": "percentage",
  "lateFeeValue": 5,
  "paymentWindowDays": 30
}
```

Success response:

```json
{
  "success": true,
  "preview": {
    "student": {
      "id": "67f7f4c9f0b0f1d7d4db1001",
      "itNumber": "IT2023001",
      "fullName": "Nimal Perera"
    },
    "room": {
      "id": "67f7f540f0b0f1d7d4db3001",
      "roomId": "RM-123456",
      "roomNumber": "A-101",
      "monthlyPrice": 15000
    },
    "roomDetails": {
      "roomNumber": "A-101",
      "block": "A",
      "roomPrice": 15000
    },
    "charges": {
      "currentBill": 3500,
      "waterBill": 1200,
      "additionalFees": [
        { "label": "Maintenance Fee", "amount": 500 },
        { "label": "Security Fee", "amount": 750 }
      ],
      "lateFeeType": "percentage",
      "lateFeeValue": 5,
      "paymentWindowDays": 30
    },
    "pricing": {
      "roomPrice": 15000,
      "currentBill": 3500,
      "waterBill": 1200,
      "additionalFeesTotal": 1250,
      "total": 20950
    },
    "totalPrice": 20950
  }
}
```

---

## 5.2 Create or Update Student Fee Profile

Save student-wise fee settings used for future bill generation.

```http
PUT {{baseUrl}}/api/payments/profiles/upsert/{{studentId}}
```

Access:

- admin only

Body example:

```json
{
  "roomNumber": "A-101",
  "block": "A",
  "currentBill": 3500,
  "waterBill": 1200,
  "additionalFees": [{ "label": "Maintenance Fee", "amount": 500 }],
  "lateFeeType": "percentage",
  "lateFeeValue": 5,
  "paymentWindowDays": 30,
  "notes": "Semester 1 billing profile",
  "isActive": true
}
```

Success response:

```json
{
  "success": true,
  "message": "Student fee profile saved successfully.",
  "profile": {
    "id": "67f80179f0b0f1d7d4db7001",
    "student": {
      "id": "67f7f4c9f0b0f1d7d4db1001",
      "itNumber": "IT2023001",
      "fullName": "Nimal Perera"
    },
    "roomDetails": {
      "roomId": "RM-123456",
      "roomNumber": "A-101",
      "block": "A",
      "roomPrice": 15000,
      "syncWithRoomPrice": true
    },
    "charges": {
      "currentBill": 3500,
      "waterBill": 1200,
      "additionalFees": [{ "label": "Maintenance Fee", "amount": 500 }],
      "lateFeeType": "percentage",
      "lateFeeValue": 5,
      "paymentWindowDays": 30
    },
    "lastPricingTotal": 20200
  }
}
```

---

## 5.3 View Student Fee Profile

```http
GET {{baseUrl}}/api/payments/profiles/view/{{studentId}}
```

Tip:

- student can use `me` instead of a Mongo id
- admin can use any student id

Example:

```http
GET {{baseUrl}}/api/payments/profiles/view/me
```

---

## 5.4 Generate Monthly Bills

Generate current month or selected month bills.

```http
POST {{baseUrl}}/api/payments/bills/generate
```

Access:

- admin only

Generate for all students:

```json
{
  "billMonth": "2026-04",
  "overwrite": false
}
```

Generate for one student:

```json
{
  "studentId": "{{studentId}}",
  "billMonth": "2026-04",
  "issuedDate": "2026-04-01",
  "dueDate": "2026-05-01",
  "overwrite": true,
  "notes": "April monthly bill"
}
```

Success response:

```json
{
  "success": true,
  "message": "Bills generated successfully.",
  "count": 1,
  "bills": [
    {
      "created": true,
      "id": "67f80521f0b0f1d7d4db8001",
      "billId": "BILL-12345678-123",
      "billMonth": "2026-04",
      "status": "pending",
      "redBill": true,
      "breakdown": {
        "roomPrice": 15000,
        "currentBill": 3500,
        "waterBill": 1200,
        "lateFee": 0
      },
      "totals": {
        "subtotal": 20200,
        "total": 20200,
        "paid": 0,
        "outstanding": 20200
      }
    }
  ]
}
```

---

## 5.5 Get Student Bills

```http
GET {{baseUrl}}/api/payments/bills/student/{{studentId}}
```

Access:

- student: own bills
- admin: any student

Examples:

```http
GET {{baseUrl}}/api/payments/bills/student/me
GET {{baseUrl}}/api/payments/bills/student/{{studentId}}?billMonth=2026-04
GET {{baseUrl}}/api/payments/bills/student/{{studentId}}?status=overdue
```

---

## 5.6 Get Student Red Bill

This is the main current bill view with room, current bill, water bill, and late fee.

```http
GET {{baseUrl}}/api/payments/red-bill/{{studentId}}
```

Examples:

```http
GET {{baseUrl}}/api/payments/red-bill/me
GET {{baseUrl}}/api/payments/red-bill/{{studentId}}?billMonth=2026-04
```

Success response:

```json
{
  "success": true,
  "redBill": {
    "billId": "BILL-12345678-123",
    "billMonth": "2026-04",
    "status": "pending",
    "redBill": true,
    "student": {
      "itNumber": "IT2023001",
      "fullName": "Nimal Perera",
      "roomNumber": "A-101",
      "block": "A"
    },
    "breakdown": {
      "roomPrice": 15000,
      "currentBill": 3500,
      "waterBill": 1200,
      "lateFee": 0,
      "additionalFees": [{ "label": "Maintenance Fee", "amount": 500 }]
    },
    "totals": {
      "subtotal": 20200,
      "total": 20200,
      "paid": 0,
      "outstanding": 20200
    }
  }
}
```

---

## 5.7 Get Student Payment Summary

```http
GET {{baseUrl}}/api/payments/summary/student/{{studentId}}
```

Examples:

```http
GET {{baseUrl}}/api/payments/summary/student/me
GET {{baseUrl}}/api/payments/summary/student/{{studentId}}
```

This response includes:

- overall billed total
- total paid
- total outstanding
- current month bill
- recent payments
- recent bill list

---

## 5.8 Update Bill Manually

Use this when admin needs to change fee amount, room amount, late fee, or due date.

```http
PUT {{baseUrl}}/api/payments/bills/update/{{billId}}
```

Access:

- admin only

Body example:

```json
{
  "roomPrice": 15000,
  "currentBill": 4500,
  "waterBill": 1800,
  "lateFee": 1000,
  "additionalFees": [
    { "label": "Maintenance Fee", "amount": 500 },
    { "label": "Library Fine", "amount": 350 }
  ],
  "dueDate": "2026-05-05",
  "notes": "Bill updated by admin after meter reading"
}
```

---

## 5.9 Apply Late Fee Manually

```http
PUT {{baseUrl}}/api/payments/bills/apply-late-fee/{{billId}}
```

Access:

- admin only

Body:

```json
{}
```

---

## 5.10 Delete Bill

```http
DELETE {{baseUrl}}/api/payments/bills/delete/{{billId}}
```

Access:

- admin only

Note:

- paid bills cannot be deleted directly

---

## 5.11 Initiate Student Payment

This sends the OTP code to the student email.

```http
POST {{baseUrl}}/api/payments/payments/initiate
```

Access:

- student normally
- admin can also call it for testing

Body example:

```json
{
  "studentId": "{{studentId}}",
  "billId": "{{billId}}",
  "amount": 20200,
  "paymentMethod": "Online",
  "referenceNumber": "BANK-REF-0091",
  "transactionReference": "TXN-2026-APR-001",
  "receiptUrl": "https://example.com/receipt/apr-001.png",
  "notes": "Paid through online bank transfer"
}
```

Success response:

```json
{
  "success": true,
  "message": "Verification code sent to the student's email address.",
  "payment": {
    "id": "67f80a35f0b0f1d7d4db9001",
    "paymentId": "PAY-12345678-456",
    "amount": 20200,
    "paymentMethod": "Online",
    "status": "otp_sent",
    "billSnapshot": {
      "billMonth": "2026-04",
      "outstandingAmount": 20200
    }
  },
  "email": {
    "delivered": true,
    "message": ""
  }
}
```

Important validation rules:

- only current month bill is allowed
- overdue bills are blocked in student flow
- amount must equal the current outstanding amount
- only one open OTP/pending payment request per bill

---

## 5.12 Verify Payment OTP

```http
POST {{baseUrl}}/api/payments/payments/verify/{{paymentId}}
```

Body example:

```json
{
  "code": "348921"
}
```

Success response:

```json
{
  "success": true,
  "message": "Payment verification completed successfully. The request is now waiting for admin approval.",
  "payment": {
    "paymentId": "PAY-12345678-456",
    "status": "pending"
  }
}
```

---

## 5.13 Review Payment

Admin accepts, rejects, or cancels a payment request.

```http
PUT {{baseUrl}}/api/payments/payments/review/{{paymentId}}
```

Access:

- admin only

Accept example:

```json
{
  "action": "accept",
  "reason": "Bank transfer confirmed"
}
```

Reject example:

```json
{
  "action": "reject",
  "reason": "Receipt details are invalid"
}
```

Cancel example:

```json
{
  "action": "cancel",
  "reason": "Student asked to cancel this payment"
}
```

Notes:

- admin can `accept`, `reject`, or `cancel` regardless of current payment status (including `otp_sent`)
- when accepted, paid amount is added to the bill and an email is sent to the student

---

## 5.14 Delete Payment Record

```http
DELETE {{baseUrl}}/api/payments/payments/delete/{{paymentId}}
```

Access:

- admin only

Important:

- if the payment was already accepted, deleting it reverses the bill paid amount

---

## 5.15 Get Admin Alerts

Get overdue and due-soon alerts for admin dashboard.

```http
GET {{baseUrl}}/api/payments/admin/alerts
```

Access:

- admin only

Success response:

```json
{
  "success": true,
  "alerts": {
    "overdueCount": 3,
    "dueSoonCount": 5,
    "overdueStudents": [],
    "dueSoonStudents": []
  }
}
```

---

## 5.16 Get Admin Payment Details with Filters

This is the main admin filter endpoint for:

- paid student
- pending payment
- overdue payment
- room-wise filter
- block-wise filter
- month filter

```http
GET {{baseUrl}}/api/payments/admin/payment-details
```

Examples:

```http
GET {{baseUrl}}/api/payments/admin/payment-details?status=paid
GET {{baseUrl}}/api/payments/admin/payment-details?status=pending&roomNumber=A-101
GET {{baseUrl}}/api/payments/admin/payment-details?status=overdue&block=A
GET {{baseUrl}}/api/payments/admin/payment-details?billMonth=2026-04&studentId={{studentId}}
```

---

## 5.17 Get Outstanding Summary

Block-wise monthly/annual outstanding details and total hostel outstanding.

```http
GET {{baseUrl}}/api/payments/admin/outstanding/summary
```

Access:

- admin only

Monthly example:

```http
GET {{baseUrl}}/api/payments/admin/outstanding/summary?scope=monthly&year=2026&month=4
```

Annual example:

```http
GET {{baseUrl}}/api/payments/admin/outstanding/summary?scope=annual&year=2026
```

Block filter example:

```http
GET {{baseUrl}}/api/payments/admin/outstanding/summary?scope=monthly&year=2026&month=4&block=A
```

Success response:

```json
{
  "success": true,
  "scope": "monthly",
  "year": 2026,
  "month": 4,
  "totalBilled": 255000,
  "totalPaid": 190000,
  "totalOutstanding": 65000,
  "hostelOutstanding": 65000,
  "byBlock": [
    {
      "block": "A",
      "totalBilled": 100000,
      "totalPaid": 70000,
      "totalOutstanding": 30000,
      "billCount": 5
    }
  ]
}
```

---

## 5.18 Generate Outstanding Report

Supports JSON or CSV.

```http
GET {{baseUrl}}/api/payments/admin/outstanding/report
```

JSON example:

```http
GET {{baseUrl}}/api/payments/admin/outstanding/report?scope=annual&year=2026
```

CSV example:

```http
GET {{baseUrl}}/api/payments/admin/outstanding/report?scope=monthly&year=2026&month=4&format=csv
```

Block CSV example:

```http
GET {{baseUrl}}/api/payments/admin/outstanding/report?scope=monthly&year=2026&month=4&block=A&format=csv
```

If `format=csv`, Postman will download or show CSV text output.

---

## 5.19 Get Payment Records

Admin-side payment request list with filters.

```http
GET {{baseUrl}}/api/payments/admin/payments
```

Examples:

```http
GET {{baseUrl}}/api/payments/admin/payments
GET {{baseUrl}}/api/payments/admin/payments?status=pending
GET {{baseUrl}}/api/payments/admin/payments?paymentMethod=Online
GET {{baseUrl}}/api/payments/admin/payments?billMonth=2026-04
GET {{baseUrl}}/api/payments/admin/payments?roomNumber=A-101
GET {{baseUrl}}/api/payments/admin/payments?block=A
```

---

## 6. Common Error Examples

### Unauthorized

```json
{
  "success": false,
  "message": "Authentication token is required."
}
```

### Student tries to pay overdue bill

```json
{
  "success": false,
  "message": "This bill is overdue. Only on-time monthly payments are allowed through the student payment flow."
}
```

### Wrong OTP

```json
{
  "success": false,
  "message": "Invalid verification code."
}
```

### Admin tries to accept before OTP verification

```json
{
  "success": true,
  "message": "Payment accepted successfully."
}
```

## 7. Email and Cron Notes

For real email sending, configure these environment variables in `Backend/.env`:

```text
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_SECURE=
EMAIL_FROM=
PAYMENT_OTP_EXPIRY_MINUTES=10
PAYMENT_OTP_MAX_ATTEMPTS=5
PAYMENT_CRON_SCHEDULE=0 8 * * *
CRON_TIMEZONE=Asia/Colombo
DEFAULT_LATE_FEE_PERCENTAGE=5
DEFAULT_PAYMENT_WINDOW_DAYS=30
```

Without SMTP configuration, Nodemailer falls back to JSON transport for safe local testing.

## 8. Frontend Mapping Notes

These endpoints are the main ones the frontend will need next:

- student dashboard: `GET /red-bill/:studentId`, `GET /summary/student/:studentId`, `POST /payments/initiate`, `POST /payments/verify/:paymentId`
- admin dashboard: `GET /admin/alerts`, `GET /admin/payment-details`, `GET /admin/payments`, `PUT /payments/review/:paymentId`
- admin student pricing: `POST /preview`, `PUT /profiles/upsert/:studentId`, `POST /bills/generate`
- reports: `GET /admin/outstanding/summary`, `GET /admin/outstanding/report`

When you give the next command, the frontend can be upgraded directly against this API contract.
