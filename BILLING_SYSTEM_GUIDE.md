# Billing System Guide

## Overview
The billing system now supports comprehensive payment processing with multiple payment methods, bill sharing options, and automatic order confirmation workflows.

## Key Features

### 1. Payment Completion Flow
- ✅ **Auto-redirect**: After successful payment, users are automatically redirected to the home page after 10 seconds
- ✅ **Confirmation Messages**: Toast notifications confirm successful payment
- ✅ **Order Summary**: Detailed bill display with all order information
- ✅ **Quick Actions**: Options to view orders or start a new order

### 2. Payment Methods

#### Online Orders
- **Card Payment** (via Stripe): Secure online payment processing for delivery orders

#### In-Store Purchases
The system now supports multiple payment methods for in-store purchases:

1. **Cash Payment**
   - Direct cash payment at the store
   - Order is immediately marked as completed
   - No external payment processing required

2. **UPI Payment**
   - Support for GPay, PhonePe, Paytm, and other UPI apps
   - Quick digital payment at the store
   - Order is immediately marked as completed

3. **Card Payment**
   - Credit/Debit card payment via Stripe
   - Secure payment processing
   - Redirects to Stripe checkout

4. **Split Payment**
   - Combine cash and digital payments
   - Enter exact amounts for each payment method
   - System validates that total matches order amount
   - Example: ₹500 cash + ₹300 digital = ₹800 total

### 3. Bill Sharing Options

After successful payment, users can share their bill in multiple ways:

#### Print Bill
- Click "Print Bill" button to open print dialog
- Generates a printer-friendly version of the bill
- Includes all order details, items, and pricing

#### Email Bill
- Click "Email Bill" button to send bill to customer's email
- Professionally formatted HTML email
- Includes complete order summary
- **Note**: Requires email service provider configuration (SendGrid, Resend, AWS SES, etc.)

#### WhatsApp Share
- Click "Share" button to share bill via WhatsApp
- Opens WhatsApp with pre-formatted message
- Includes order ID, total amount, and status
- Can be sent to any contact

### 4. Order Types

#### Online Order
- Requires full shipping address
- Shipping cost calculation based on location and weight
- Delivery to customer's address
- Payment via Stripe (card)

#### In-Store Purchase
- Requires only contact information (name, email, phone)
- No shipping cost
- Pick up at store
- Multiple payment methods available (cash, UPI, card, split)

## User Flow

### For Online Orders
1. Add items to cart
2. Go to checkout
3. Select "Online Order"
4. Fill in shipping information
5. Calculate shipping cost
6. Apply loyalty points (optional)
7. Click "Proceed to Payment"
8. Complete payment via Stripe
9. Redirected to payment success page
10. View bill, print, email, or share
11. Auto-redirect to home after 10 seconds

### For In-Store Purchases
1. Add items to cart
2. Go to checkout
3. Select "In-Store Purchase"
4. Choose payment method (Cash/UPI/Card/Split)
5. Fill in contact information
6. Apply loyalty points (optional)
7. If split payment, enter cash and digital amounts
8. Click "Complete Order"
9. For cash/UPI: Order immediately completed, redirected to success page
10. For card: Redirected to Stripe, then to success page
11. View bill, print, email, or share
12. Auto-redirect to home after 10 seconds

## Split Payment Example

**Order Total: ₹850**

Customer wants to pay:
- ₹500 in cash
- ₹350 via UPI

Steps:
1. Select "Split Payment" method
2. Enter ₹500 in "Cash Amount" field
3. Enter ₹350 in "Digital Amount" field
4. System shows: "Total: ₹850 / ₹850" ✓
5. Click "Complete Order"
6. Order is processed and completed

## Technical Details

### Database Schema
New fields added to `orders` table:
- `payment_method`: Stores the payment method used (cash, upi, card, split)
- `payment_details`: JSONB field storing additional payment information (e.g., split payment breakdown)

### Edge Functions
- `create_stripe_checkout`: Handles Stripe payment sessions for online and card payments
- `verify_stripe_payment`: Verifies Stripe payment completion
- `send_bill_email`: Generates and sends bill emails (requires email service configuration)

### Loyalty Points Integration
- Points are automatically deducted when used during checkout
- Points are automatically awarded after successful purchase (1 point per ₹100 spent)
- Works for both online and in-store purchases

## Configuration Notes

### Email Service Setup
To enable email bill functionality, configure an email service provider:

1. **Resend** (Recommended)
   - Sign up at https://resend.com
   - Get API key
   - Add to Supabase secrets: `RESEND_API_KEY`
   - Uncomment email sending code in `send_bill_email` Edge Function

2. **SendGrid**
   - Sign up at https://sendgrid.com
   - Get API key
   - Integrate with Edge Function

3. **AWS SES**
   - Configure AWS SES
   - Get credentials
   - Integrate with Edge Function

### Payment Gateway
- Stripe is configured for card payments
- Ensure `STRIPE_SECRET_KEY` is set in Supabase secrets

## Testing Checklist

### Online Orders
- [ ] Add items to cart
- [ ] Fill shipping information
- [ ] Calculate shipping cost
- [ ] Apply loyalty points
- [ ] Complete Stripe payment
- [ ] Verify order creation
- [ ] Check payment success page
- [ ] Test print functionality
- [ ] Test email functionality
- [ ] Test WhatsApp share
- [ ] Verify auto-redirect

### In-Store Cash Payment
- [ ] Select in-store purchase
- [ ] Choose cash payment
- [ ] Fill contact information
- [ ] Complete order
- [ ] Verify immediate completion
- [ ] Check success page
- [ ] Test bill sharing options

### In-Store UPI Payment
- [ ] Select in-store purchase
- [ ] Choose UPI payment
- [ ] Fill contact information
- [ ] Complete order
- [ ] Verify immediate completion
- [ ] Check success page

### In-Store Card Payment
- [ ] Select in-store purchase
- [ ] Choose card payment
- [ ] Fill contact information
- [ ] Complete Stripe payment
- [ ] Verify order creation
- [ ] Check success page

### Split Payment
- [ ] Select in-store purchase
- [ ] Choose split payment
- [ ] Enter cash amount
- [ ] Enter digital amount
- [ ] Verify total validation
- [ ] Complete order
- [ ] Check payment details stored correctly

## Troubleshooting

### Issue: Email not sending
**Solution**: Configure email service provider in Edge Function and add API key to Supabase secrets

### Issue: Split payment validation fails
**Solution**: Ensure cash + digital amounts exactly equal the order total (within 1 paisa tolerance)

### Issue: Stripe payment not processing
**Solution**: Verify `STRIPE_SECRET_KEY` is set correctly in Supabase secrets

### Issue: Auto-redirect not working
**Solution**: Check browser console for errors, ensure navigation is not blocked

## Future Enhancements

Potential improvements for the billing system:
- QR code generation for UPI payments
- SMS bill notifications
- PDF bill download
- Receipt printer integration
- Refund/void transaction functionality
- Payment history tracking
- Multiple currency support
- Discount codes and coupons
- Tax invoice generation
