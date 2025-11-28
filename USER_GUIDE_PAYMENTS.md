# User Guide: Date Validation & Vendor Payments

## Date Validation for Shipments

### Overview
The system now ensures that shipment dates are always logical and consistent with order dates. This prevents data entry errors and maintains data integrity.

### How It Works

#### When Creating or Updating Shipments
1. **Shipped Date**: Cannot be set to a date before the order was created
2. **Delivery Date**: Cannot be set to a date before the shipment was shipped

#### Visual Indicators
- Date input fields show the minimum allowed date
- Helper text displays the order date for reference
- Error messages appear if you try to select an invalid date

#### Example Scenario
```
Order Created: January 15, 2025
✅ Valid Shipped Date: January 16, 2025 or later
❌ Invalid Shipped Date: January 14, 2025 (before order date)

Shipped Date: January 16, 2025
✅ Valid Delivery Date: January 17, 2025 or later
❌ Invalid Delivery Date: January 15, 2025 (before shipped date)
```

### What Happens If You Try Invalid Dates
- **Client-side**: The date picker won't let you select dates before the minimum
- **Form validation**: An error message appears if you somehow enter an invalid date
- **Server-side**: The database will reject the update and show an error message

## Vendor Payment Tracking

### Overview
Track all payments made to your suppliers and vendors in one centralized location. Monitor spending, maintain payment records, and generate summaries by vendor.

### Accessing Vendor Payments
1. Log in as an admin
2. Go to Admin Dashboard
3. Click on the "Vendor Payments" tab

### Dashboard Overview

#### Summary Cards
- **Total Paid**: Shows the total amount paid to all vendors (all time)
- **Total Payments**: Number of payment records in the system
- **Unique Vendors**: Number of different vendors you've paid

#### Payment Summary Table
Shows aggregated statistics for each vendor:
- Vendor name and contact information
- Total number of payments made
- Total amount paid
- Date of last payment

#### All Payments Table
Detailed list of every payment record with:
- Vendor name
- Purpose (what was purchased)
- Amount paid
- Payment date
- Payment method
- Reference number (transaction ID, cheque number, etc.)
- Edit and delete actions

### Recording a New Payment

1. Click the **"Record Payment"** button
2. Fill in the payment details:
   - **Vendor Name** (required): Type the vendor name. If you've paid them before, it will autocomplete
   - **Vendor Contact** (optional): Phone number or email
   - **Amount** (required): Payment amount (e.g., 5000.00)
   - **Payment Date** (required): When the payment was made
   - **Payment Method** (required): Choose from:
     - Cash
     - Bank Transfer
     - UPI
     - Cheque
     - Card
   - **Reference Number** (optional): Transaction ID, cheque number, UTR number, etc.
   - **Purpose** (optional): What you purchased (e.g., "Rice - 100kg", "Packaging materials")
   - **Notes** (optional): Any additional details
3. Click **"Record Payment"**

### Editing a Payment

1. Find the payment in the "All Payments" table
2. Click the **Edit** button (pencil icon)
3. Update the necessary fields
4. Click **"Update Payment"**

### Deleting a Payment

1. Find the payment in the "All Payments" table
2. Click the **Delete** button (trash icon)
3. Confirm the deletion

⚠️ **Warning**: Deletion is permanent and cannot be undone!

### Best Practices

#### Payment Recording
- Record payments as soon as they're made
- Always include a reference number for bank transfers and cheques
- Use the Purpose field to describe what was purchased
- Keep vendor names consistent (use autocomplete to avoid duplicates)

#### Reference Numbers
- **Bank Transfer**: Use UTR/transaction reference number
- **Cheque**: Use cheque number
- **UPI**: Use UPI transaction ID
- **Cash**: Can leave blank or use receipt number

#### Vendor Names
- Use consistent naming (e.g., always "ABC Suppliers" not "ABC" or "ABC Supplier")
- The autocomplete feature helps maintain consistency
- Include vendor contact information for easy reference

### Viewing Payment History

#### For a Specific Vendor
1. Look at the "Payment Summary by Vendor" table
2. Find the vendor row to see:
   - Total payments made
   - Total amount paid
   - Last payment date

#### For All Vendors
- Scroll through the "All Payment Records" table
- Use browser search (Ctrl+F / Cmd+F) to find specific payments

### Reports and Analytics

#### Current Features
- Total paid across all vendors
- Payment count by vendor
- Last payment date tracking
- Vendor-wise payment summaries

#### Coming Soon
- Date range filtering
- Export to Excel/CSV
- Payment trend charts
- Vendor comparison reports

### Troubleshooting

#### "Failed to load payment data"
- Check your internet connection
- Refresh the page
- Contact support if the issue persists

#### "Failed to save payment"
- Ensure all required fields are filled
- Check that the amount is a valid number
- Verify the payment date is valid
- Try again or contact support

#### Payment not appearing in summary
- Refresh the page
- Check if the payment was actually saved
- Verify you're looking at the correct vendor name

### Tips for Efficient Use

1. **Batch Entry**: If you have multiple payments to record, keep the dialog open and record them one after another
2. **Consistent Naming**: Always use the same vendor name format to avoid duplicate entries
3. **Regular Updates**: Record payments daily or weekly to maintain accurate records
4. **Use Purpose Field**: This helps when reviewing expenses later
5. **Keep References**: Always save transaction references for audit purposes

### Security Notes

- Only admin users can access payment records
- All payment data is encrypted in transit and at rest
- Payment records include audit timestamps (created_at, updated_at)
- Deleted payments are permanently removed (no soft delete)

### Support

If you encounter any issues or have questions:
1. Check this user guide first
2. Review the Implementation Summary for technical details
3. Contact your system administrator
4. Report bugs or request features through your support channel
