# Task: Add In-Store vs Online Order Differentiation

## Requirements
- Add checkbox/field to distinguish online orders from in-store purchases
- In-store purchases don't need shipment tracking
- Separate views for in-store purchases and online orders
- Different order flows for each type

## Plan

- [x] Step 1: Database Changes
  - [x] Add order_type enum to orders table
  - [x] Make shipping fields optional for in-store orders
  - [x] Update migration file

- [x] Step 2: Update Types
  - [x] Add OrderType enum to types.ts
  - [x] Update Order interface

- [x] Step 3: Update API Functions
  - [x] Add order type parameter to create order
  - [x] Add filter by order type
  - [x] Update queries

- [x] Step 4: Update Checkout Flow
  - [x] Add order type selection
  - [x] Conditionally show/hide shipping fields
  - [x] Update order creation logic

- [x] Step 5: Update Admin Dashboard
  - [x] Add order type filter
  - [x] Separate metrics for online vs in-store
  - [x] Update order display
  - [x] Update order detail dialog

- [x] Step 6: Update Edge Function
  - [x] Add order_type parameter to Edge Function
  - [x] Pass order_type to database

- [x] Step 7: Testing
  - [x] Test in-store order creation
  - [x] Test online order creation
  - [x] Test filtering
  - [x] Run linter
  - [x] Deploy Edge Function

## Notes
- In-store orders: pending → processing → completed
- Online orders: pending → processing → shipped → delivered
- In-store orders don't need shipping address or shipment tracking
- Shipping cost is 0 for in-store orders
