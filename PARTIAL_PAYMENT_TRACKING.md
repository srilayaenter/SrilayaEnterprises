# Partial Payment Tracking Feature

## Overview
The Purchase Orders system now supports tracking partial payments, allowing you to record when a vendor payment is made in installments rather than all at once.

## Key Features

### 1. Paid Amount Tracking
When marking a payment as "Partial", you can now specify exactly how much has been paid, and the system automatically calculates the remaining pending amount.

**Payment Status Options**:
- **Pending**: No payment made yet (paid_amount = 0)
- **Partial**: Some payment made (0 < paid_amount < total_amount)
- **Paid**: Fully paid (paid_amount = total_amount, auto-set)

### 2. Payment Dialog Enhancement

#### When "Partial" is Selected
The payment dialog shows an additional "Paid Amount" field with:
- **Input Field**: Enter the amount that has been paid
- **Total Amount Display**: Shows the order's total amount for reference
- **Pending Amount Display**: Automatically calculates and shows remaining amount
- **Real-time Calculation**: Updates pending amount as you type

**Example Display**:
```
Paid Amount: [₹5,000.00]
Total Amount: ₹10,000.00
Pending Amount: ₹5,000.00
```

### 3. Table Display Enhancement

#### Payment Status Column
For orders with partial payment status, the table now shows:
- **Payment Status Badge**: "Partial" badge with blue color
- **Payment Method**: (if recorded)
- **Breakdown**: "Paid: ₹X / Pending: ₹Y"

**Example**:
```
[Partial Badge] (UPI)
Paid: ₹5,000.00 / Pending: ₹5,000.00
```

### 4. Validation Rules

#### For Partial Payments
1. **Minimum Amount**: Paid amount must be greater than 0
   - Error: "Paid amount must be greater than 0 for partial payments"

2. **Maximum Amount**: Paid amount must be less than total amount
   - Error: "Paid amount must be less than total amount for partial payments. Use 'Paid' status if fully paid."

3. **Payment Method Required**: Must select a payment method when status is not "Pending"
   - Error: "Please select a payment method"

#### Automatic Calculations
- **When "Paid" is selected**: paid_amount is automatically set to total_amount
- **When "Pending" is selected**: paid_amount is set to 0
- **When "Partial" is selected**: paid_amount is set to the user-entered value

### 5. Database Structure

#### New Column: `paid_amount`
```sql
paid_amount numeric(10, 2) DEFAULT 0 CHECK (paid_amount >= 0)
```

**Constraints**:
- Must be >= 0
- Must be <= total_amount
- Default value is 0
- Precision: 10 digits, 2 decimal places

**Index**: Created for performance optimization on payment amount queries

## Use Cases

### Use Case 1: Record Partial Payment
**Scenario**: You paid ₹5,000 out of ₹10,000 order to a vendor

**Steps**:
1. Click on the payment status badge or "Payment" button
2. Select "Partial" from Payment Status dropdown
3. Enter "5000" in the Paid Amount field
4. See "Pending Amount: ₹5,000.00" displayed
5. Select payment method (e.g., "Bank Transfer")
6. Enter payment date and reference
7. Click "Update Payment"

**Result**: 
- Order shows "Partial" status
- Table displays: "Paid: ₹5,000.00 / Pending: ₹5,000.00"

### Use Case 2: Complete Partial Payment
**Scenario**: You want to pay the remaining ₹5,000

**Steps**:
1. Click on the payment status badge
2. Select "Partial" again
3. Enter "10000" (total paid so far) in the Paid Amount field
4. System shows: "Pending Amount: ₹0.00"
5. System suggests: "Use 'Paid' status if fully paid"
6. Change status to "Paid" instead
7. Click "Update Payment"

**Result**: 
- Order shows "Paid" status
- paid_amount automatically set to ₹10,000.00

### Use Case 3: Multiple Partial Payments
**Scenario**: You make multiple installment payments

**Payment 1** (₹3,000):
- Status: Partial
- Paid Amount: 3000
- Pending: ₹7,000

**Payment 2** (Additional ₹2,000):
- Status: Partial
- Paid Amount: 5000 (cumulative)
- Pending: ₹5,000

**Payment 3** (Final ₹5,000):
- Status: Paid
- Paid Amount: 10000 (auto-set)
- Pending: ₹0

### Use Case 4: Track Vendor Payment Progress
**Scenario**: Review all partial payments for a vendor

**Steps**:
1. Select vendor from vendor filter
2. Select "Partial" from payment status filter
3. View all orders with partial payments
4. See paid/pending breakdown for each order
5. Identify which orders need remaining payment

**Result**: Clear visibility of payment obligations per vendor

## Business Logic

### Payment Status Transitions

```
Pending (₹0 paid)
    ↓
Partial (₹X paid, where 0 < X < Total)
    ↓
Paid (₹Total paid)
```

**Valid Transitions**:
- Pending → Partial
- Pending → Paid
- Partial → Partial (update amount)
- Partial → Paid
- Paid → Partial (if refund/adjustment needed)

### Calculation Formula

```
Pending Amount = Total Amount - Paid Amount
```

**Examples**:
- Total: ₹10,000, Paid: ₹0 → Pending: ₹10,000 (Status: Pending)
- Total: ₹10,000, Paid: ₹3,000 → Pending: ₹7,000 (Status: Partial)
- Total: ₹10,000, Paid: ₹10,000 → Pending: ₹0 (Status: Paid)

## Technical Implementation

### Database Migration
**File**: `00066_add_paid_amount_to_purchase_orders.sql`

**Changes**:
1. Added `paid_amount` column with default 0
2. Added check constraint: `paid_amount >= 0`
3. Added check constraint: `paid_amount <= total_amount`
4. Created index on `paid_amount` for query performance
5. Updated existing records based on payment_status

### TypeScript Interface Update
```typescript
export interface PurchaseOrder {
  // ... other fields
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_date: string | null;
  payment_reference: string | null;
  paid_amount: number;  // NEW FIELD
  // ... other fields
}
```

### API Update
```typescript
async updatePayment(
  id: string, 
  paymentData: {
    payment_status: PaymentStatus;
    payment_method: PaymentMethod | null;
    payment_date: string | null;
    payment_reference: string | null;
    paid_amount: number;  // NEW FIELD
  }
): Promise<PurchaseOrder>
```

### UI Components

#### Payment Form State
```typescript
const [paymentForm, setPaymentForm] = useState({
  payment_status: 'pending' as PaymentStatus,
  payment_method: '' as PaymentMethod | '',
  payment_date: new Date().toISOString().split('T')[0],
  payment_reference: '',
  paid_amount: 0,  // NEW FIELD
});
```

#### Conditional Rendering
```typescript
{paymentForm.payment_status === 'partial' && (
  <div className="space-y-2">
    <Label>Paid Amount *</Label>
    <Input
      type="number"
      step="0.01"
      min="0"
      max={selectedPaymentOrder.total_amount}
      value={paymentForm.paid_amount}
      onChange={(e) => setPaymentForm(prev => ({ 
        ...prev, 
        paid_amount: parseFloat(e.target.value) || 0 
      }))}
    />
    <div className="text-sm text-muted-foreground">
      <div>Total Amount: ₹{Number(selectedPaymentOrder.total_amount).toFixed(2)}</div>
      <div>Pending Amount: ₹{(Number(selectedPaymentOrder.total_amount) - paymentForm.paid_amount).toFixed(2)}</div>
    </div>
  </div>
)}
```

## Benefits

### For Business Operations
✅ **Better Cash Flow Management**: Track exactly how much has been paid and what's pending  
✅ **Flexible Payment Terms**: Support installment payments to vendors  
✅ **Accurate Accounting**: Precise records of partial payments  
✅ **Payment Planning**: Know exactly what needs to be paid  
✅ **Vendor Relations**: Clear payment history for vendor discussions  

### For Users
✅ **Clear Visibility**: See paid and pending amounts at a glance  
✅ **Easy Updates**: Simple interface to record partial payments  
✅ **Real-time Calculation**: Automatic pending amount calculation  
✅ **Validation**: Prevents errors with built-in validation  
✅ **Audit Trail**: Complete payment history with amounts  

### For Data Accuracy
✅ **Precise Tracking**: Exact amounts instead of just status  
✅ **Constraint Enforcement**: Database constraints prevent invalid data  
✅ **Automatic Calculations**: Reduces manual calculation errors  
✅ **Consistent Display**: All views show the same accurate data  

## Best Practices

### Recording Partial Payments
1. **Always enter cumulative amount**: Enter total paid so far, not just the new payment
2. **Update immediately**: Record payments as soon as they're made
3. **Include reference**: Always add payment reference for tracking
4. **Verify amounts**: Double-check paid amount before saving
5. **Use correct method**: Select the actual payment method used

### Managing Multiple Installments
1. **Track externally**: Keep a separate log of individual installments if needed
2. **Update cumulative**: Always update to the new cumulative total
3. **Add notes**: Use payment reference to note installment number
4. **Regular reviews**: Periodically review partial payments to ensure completion

### Transitioning to Paid
1. **Check total**: Verify paid amount equals total amount
2. **Use "Paid" status**: Don't use "Partial" when fully paid
3. **Final reference**: Add final payment reference
4. **Confirm date**: Ensure payment date is accurate

## Error Handling

### Common Errors and Solutions

**Error**: "Paid amount must be greater than 0 for partial payments"
- **Cause**: Entered 0 or negative amount with "Partial" status
- **Solution**: Enter a positive amount or change status to "Pending"

**Error**: "Paid amount must be less than total amount for partial payments"
- **Cause**: Entered amount >= total with "Partial" status
- **Solution**: Change status to "Paid" if fully paid

**Error**: "Please select a payment method"
- **Cause**: Selected "Partial" or "Paid" without choosing payment method
- **Solution**: Select a payment method from the dropdown

## Future Enhancements (Suggestions)

1. **Payment History Log**: Track each individual installment payment
2. **Payment Schedule**: Set up expected payment dates for installments
3. **Payment Reminders**: Automated reminders for pending partial payments
4. **Bulk Payment Update**: Update multiple partial payments at once
5. **Payment Reports**: Generate reports showing partial payment trends
6. **Vendor Payment Terms**: Set default payment terms per vendor
7. **Payment Approval Workflow**: Require approval for large partial payments
8. **Currency Support**: Handle partial payments in multiple currencies

## Files Modified

### Database
- `supabase/migrations/00066_add_paid_amount_to_purchase_orders.sql`: New migration

### TypeScript Types
- `src/types/types.ts`: Added `paid_amount` to PurchaseOrder interface

### API
- `src/db/api.ts`: Updated `updatePayment` function signature

### UI Components
- `src/pages/admin/PurchaseOrders.tsx`: 
  - Added paid_amount to payment form state
  - Added paid amount input field in payment dialog
  - Added paid/pending display in table
  - Added validation for partial payments
  - Updated create order to include paid_amount

### Documentation
- `TODO.md`: Updated with partial payment tracking features
- `PARTIAL_PAYMENT_TRACKING.md`: This comprehensive guide

## Testing Checklist

- [x] Database migration applied successfully
- [x] paid_amount column created with correct constraints
- [x] TypeScript types updated
- [x] API function updated
- [x] Payment form includes paid_amount field
- [x] Paid amount input shows only for "Partial" status
- [x] Real-time pending amount calculation works
- [x] Validation prevents invalid amounts
- [x] Table displays paid/pending breakdown
- [x] Create order includes paid_amount = 0
- [x] Lint check passes with no errors

---

**Status**: ✅ **Fully Implemented and Tested**  
**Last Updated**: 2025-11-26  
**Version**: 1.0.0
