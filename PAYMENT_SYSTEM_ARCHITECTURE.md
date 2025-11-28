# Payment System Architecture

## Overview
The Srilaya Enterprises system has multiple payment tracking mechanisms designed for different purposes. This document explains the architecture and when to use each system.

## Payment Tables

### 1. vendor_transactions
**Purpose**: Track all financial transactions with product vendors (purchases, payments, returns)

**Structure**:
- `id` (uuid, primary key)
- `vendor_id` (uuid, references vendors table)
- `transaction_type` (enum: 'purchase', 'payment', 'return')
- `amount` (numeric)
- `payment_method` (enum: 'cash', 'bank_transfer', 'upi', 'cheque', 'card')
- `reference_number` (text)
- `description` (text)
- `transaction_date` (date)
- `created_at` (timestamptz)

**Use Cases**:
- Recording product purchases from vendors
- Tracking payments made to vendors for purchases
- Recording product returns to vendors
- Maintaining vendor account balances

**Integration**: Linked to the vendors table via vendor_id

### 2. shipment_handler_transactions
**Purpose**: Track payments made to delivery handlers for shipment services

**Structure**:
- `id` (uuid, primary key)
- `handler_id` (uuid, references shipment_handlers table)
- `amount` (numeric)
- `payment_method` (enum: 'cash', 'bank_transfer', 'upi', 'cheque', 'card')
- `reference_number` (text)
- `description` (text)
- `transaction_date` (date)
- `created_at` (timestamptz)

**Use Cases**:
- Recording payments to handlers for completed deliveries
- Tracking handler earnings
- Maintaining handler payment history

**Integration**: Linked to the shipment_handlers table via handler_id

### 3. handler_payments
**Purpose**: Track shipment-specific payment status for orders

**Structure**:
- `id` (uuid, primary key)
- `order_id` (uuid, references orders table, required)
- `handler_id` (uuid, references shipment_handlers table)
- `payment_amount` (numeric)
- `payment_status` (enum: 'pending', 'paid', 'failed', 'refunded')
- `payment_method` (enum)
- `transaction_reference` (text)
- `payment_date` (timestamptz)
- `notes` (text)
- `created_at`, `updated_at` (timestamptz)

**Use Cases**:
- Tracking payment status for specific orders
- Managing order-linked shipment payments
- Handling payment failures and refunds

**Integration**: Tightly coupled with orders and shipments

### 4. vendor_payments
**Purpose**: Simple, standalone payment tracking for ad-hoc vendor payments

**Structure**:
- `id` (uuid, primary key)
- `vendor_name` (text, not linked to vendors table)
- `vendor_contact` (text)
- `amount` (numeric)
- `payment_date` (date)
- `payment_method` (enum: 'cash', 'bank_transfer', 'upi', 'cheque', 'card')
- `reference_number` (text)
- `purpose` (text)
- `notes` (text)
- `created_at`, `updated_at` (timestamptz)

**Use Cases**:
- Quick payment recording without vendor setup
- Tracking miscellaneous vendor payments
- Recording payments to suppliers not in the vendors table
- Simple payment history for accounting

**Integration**: Standalone, no foreign key constraints

## When to Use Each System

### Use vendor_transactions When:
- Recording purchases from registered vendors
- Tracking payments for specific purchase orders
- Managing vendor account balances
- Need full integration with inventory and vendor management

### Use shipment_handler_transactions When:
- Paying handlers for delivery services
- Tracking handler earnings and payment history
- Need to link payments to specific handlers

### Use handler_payments When:
- Tracking payment status for specific orders
- Managing order-linked shipment payments
- Need to handle payment failures and refunds
- Require order-specific payment tracking

### Use vendor_payments When:
- Making quick payments to suppliers
- Paying vendors not registered in the system
- Recording miscellaneous supplier payments
- Need simple payment tracking without complex integrations
- Recording one-time or ad-hoc payments

## UI Access Points

### Admin Dashboard Tabs:
1. **Vendor Payments** - Manages vendor_payments table
   - Simple payment recording
   - Payment history by vendor
   - Summary statistics

2. **Vendor Management** (Future) - Would manage vendor_transactions
   - Purchase orders
   - Payment tracking
   - Account balances

3. **Handler Management** (Future) - Would manage shipment_handler_transactions
   - Handler payments
   - Earnings reports
   - Payment history

4. **Shipment Tracking** - Displays handler_payments status
   - Order-linked payment status
   - Payment tracking per shipment

## Data Flow Examples

### Example 1: Purchasing Products from a Vendor
```
1. Create purchase order → vendor_transactions (type: 'purchase')
2. Make payment → vendor_transactions (type: 'payment')
3. Update vendor balance
```

### Example 2: Paying a Delivery Handler
```
1. Complete delivery → Update shipment status
2. Record payment → shipment_handler_transactions
3. Update handler earnings
```

### Example 3: Quick Supplier Payment
```
1. Receive invoice from supplier
2. Make payment → vendor_payments (simple recording)
3. Done (no complex integrations)
```

### Example 4: Order Shipment Payment
```
1. Create order → Create shipment
2. Assign handler → handler_payments (status: 'pending')
3. Complete delivery → Update handler_payments (status: 'paid')
4. Record transaction → shipment_handler_transactions
```

## Payment Method Enum
All payment tables use the same payment_method enum:
- `cash` - Cash payments
- `bank_transfer` - Bank transfers (include UTR/reference)
- `upi` - UPI payments (include transaction ID)
- `cheque` - Cheque payments (include cheque number)
- `card` - Card payments (include transaction reference)

## Best Practices

### For vendor_transactions:
- Always link to a registered vendor (vendor_id required)
- Use appropriate transaction_type
- Include detailed descriptions
- Keep reference numbers for audit trail

### For shipment_handler_transactions:
- Record payments after delivery completion
- Include handler_id for proper tracking
- Use description to note which deliveries were paid
- Keep transaction references

### For handler_payments:
- Always link to an order
- Update payment_status as it changes
- Record payment_date when status changes to 'paid'
- Use notes for any special circumstances

### For vendor_payments:
- Use consistent vendor naming
- Always include payment_method
- Record reference numbers for non-cash payments
- Use purpose field to describe what was purchased
- Add notes for any special terms or conditions

## Future Enhancements

### Planned Features:
1. **Unified Payment Dashboard**
   - View all payments across all systems
   - Filter by date range, payment method, vendor/handler
   - Export reports

2. **Payment Reconciliation**
   - Match payments with invoices
   - Track outstanding balances
   - Generate payment reminders

3. **Analytics and Reports**
   - Payment trends over time
   - Vendor/handler payment summaries
   - Payment method analysis
   - Cash flow reports

4. **Integration**
   - Link vendor_payments to vendor_transactions
   - Auto-create transactions from payments
   - Sync with accounting systems

## Database Relationships

```
vendors (1) ----< (many) vendor_transactions
shipment_handlers (1) ----< (many) shipment_handler_transactions
orders (1) ----< (many) handler_payments
shipment_handlers (1) ----< (many) handler_payments

vendor_payments - Standalone (no foreign keys)
```

## Migration History

### Date Validation:
- `20250126_validate_shipment_dates.sql` - Added triggers to prevent invalid shipment dates

### Payment Tables:
- `00031_create_vendor_payments_table.sql` - Created vendor_payments table and summary view

### Existing Tables:
- vendor_transactions - Created in earlier migrations
- shipment_handler_transactions - Created in earlier migrations
- handler_payments - Created in earlier migrations

## Notes

### Why Multiple Payment Systems?
The system evolved to handle different business needs:
- **vendor_transactions**: Full-featured vendor management with purchase tracking
- **shipment_handler_transactions**: Handler-specific payment tracking
- **handler_payments**: Order-linked payment status management
- **vendor_payments**: Simple, flexible payment recording

Each serves a specific purpose and provides the right level of complexity for its use case.

### Data Consistency
- All payment amounts use `numeric` type for precision
- All dates use consistent formats (date for transaction dates, timestamptz for audit timestamps)
- Payment methods are standardized across all tables
- Reference numbers are optional but recommended for non-cash payments

### Security
- All payment tables have appropriate RLS policies
- Only admin users can access payment data
- Audit trails maintained with created_at/updated_at timestamps
- Sensitive data encrypted at rest and in transit
