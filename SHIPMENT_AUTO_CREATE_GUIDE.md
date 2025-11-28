# Automatic Shipment Creation for Online Orders

## Overview

The system now automatically creates shipment entries for all orders with type "online" when payment is completed. Admins can then manage these shipments through the Shipment Tracking interface.

## How It Works

### 1. Automatic Shipment Creation

When a customer completes payment for an **online order**:
- ✅ A shipment entry is automatically created in the database
- ✅ The shipment is assigned a tracking number (format: `SHIP-XXXXXXXX`)
- ✅ Initial status is set to "pending"
- ✅ The shipment is linked to the order

**Note:** In-store purchases do NOT create shipment entries since they don't require shipping.

### 2. Shipment Management by Admins

Admins can manage shipments through the **Admin Dashboard → Shipments** tab:

#### Available Actions:
- View all shipments with order details
- Assign shipment handler
- Set shipped date
- Set expected delivery date
- Update shipment status
- Add notes and tracking information

## Admin Workflow

### Step 1: Access Shipment Tracking
1. Log in as admin
2. Go to **Admin Dashboard**
3. Click on the **Shipments** tab
4. You'll see all shipments, including newly created ones from online orders

### Step 2: Edit Shipment Details
1. Find the shipment you want to update
2. Click the **"Edit Details"** button
3. A dialog will open with the following fields:

#### Shipment Handler
- Select from the list of active shipment handlers
- Shows handler name and service type
- Example: "DHL Express - courier"

#### Shipped Date
- Use the calendar picker to select when the order was shipped
- This is the date the package left your facility

#### Expected Delivery Date
- Use the calendar picker to select the expected delivery date
- This helps customers know when to expect their order

#### Status
- **Pending**: Order is ready to be shipped
- **Picked Up**: Handler has collected the package
- **In Transit**: Package is on its way
- **Out for Delivery**: Package is with the delivery person
- **Delivered**: Package has been delivered
- **Returned**: Package was returned
- **Cancelled**: Shipment was cancelled

#### Return Reason (if status is "Returned")
- Provide a reason why the package was returned
- Example: "Customer refused delivery", "Address not found"

#### Notes
- Add any additional information about the shipment
- Example: "Fragile items", "Requires signature"

### Step 3: Save Changes
- Click **"Update Shipment"** to save your changes
- The shipment details will be updated immediately
- Order status will be automatically synced based on shipment status

## Shipment Status Flow

### Typical Shipment Lifecycle:
1. **Pending** → Order paid, waiting to be shipped
2. **Picked Up** → Handler collected the package
3. **In Transit** → Package is being transported
4. **Out for Delivery** → Package is with delivery person
5. **Delivered** → Package delivered to customer

### Order Status Synchronization:
- When shipment status changes, the order status is automatically updated:
  - **Picked Up / In Transit / Out for Delivery** → Order status: "Shipped"
  - **Delivered** → Order status: "Delivered"
  - **Returned** → Order status: "Cancelled"

## Key Features

### ✅ Automatic Creation
- No manual entry needed for online orders
- Shipments are created immediately after payment
- Tracking numbers are auto-generated

### ✅ Flexible Management
- Assign handlers at any time
- Update dates as needed
- Track status changes
- Add notes for internal reference

### ✅ Customer Visibility
- Customers can view their shipment status
- Tracking information is available in their order history
- Expected delivery dates help set expectations

### ✅ Handler Integration
- Select from pre-configured shipment handlers
- Each handler has service type (courier, freight, local delivery)
- Only active handlers are shown in the selection

## Best Practices

### 1. Timely Updates
- Update shipment status as soon as it changes
- Set shipped date when the package leaves your facility
- Provide realistic expected delivery dates

### 2. Handler Assignment
- Assign a handler as soon as you know who will deliver
- Choose handlers based on destination and service type
- Keep handler information up to date

### 3. Communication
- Use notes field for important information
- Document any special handling requirements
- Record any issues or delays

### 4. Status Accuracy
- Keep status updated throughout the delivery process
- Mark as delivered only when confirmed
- Provide return reasons when applicable

## Troubleshooting

### Shipment Not Created Automatically?
**Possible Causes:**
1. Order type is "instore" (in-store purchases don't need shipping)
2. Payment not completed successfully
3. System error during order processing

**Solution:**
- Verify the order type in the Orders tab
- Check payment status
- Manually create shipment if needed using "Add New Shipment" button

### Can't Select Handler?
**Possible Causes:**
1. No active handlers in the system
2. All handlers are marked as inactive

**Solution:**
- Go to **Admin Dashboard → Handlers** tab
- Add new handlers or activate existing ones
- Ensure at least one handler is marked as "active"

### Date Picker Not Working?
**Solution:**
- Use the calendar icon to open the date picker
- Dates must be in YYYY-MM-DD format
- Shipped date should not be in the future
- Expected delivery should be after shipped date

## Technical Details

### Database Structure
```sql
shipments table:
- id: Unique shipment identifier
- order_id: Links to the order
- handler_id: Links to shipment handler
- tracking_number: Auto-generated tracking number
- status: Current shipment status
- shipped_date: When package was shipped
- expected_delivery_date: Expected delivery date
- actual_delivery_date: Actual delivery date (auto-set)
- return_reason: Reason if returned
- notes: Additional information
```

### Automatic Creation Logic
- Triggered by: `verify_stripe_payment` Edge Function
- Condition: `order.order_type === 'online'`
- Tracking Number Format: `SHIP-{first 8 chars of order ID}`
- Initial Status: `pending`

### Status Synchronization
- Automatic trigger updates order status when shipment status changes
- Ensures order and shipment status stay in sync
- Prevents manual status conflicts

## Summary

✅ **Online orders automatically create shipment entries** when payment is completed

✅ **Admins can manage all shipment details** including handler, dates, and status

✅ **Simple workflow** - just click "Edit Details" and update the fields

✅ **Automatic synchronization** keeps order and shipment status aligned

✅ **Customer visibility** allows customers to track their orders

For more information about managing shipment handlers, see the Handlers management section in the Admin Dashboard.
