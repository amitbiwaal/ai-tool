# Razorpay Payment Integration Setup

## ✅ API Keys Configured

Razorpay test keys have been added to `.env.local`:

```
RAZORPAY_KEY_ID=rzp_test_RktD6xekngGnnZ
RAZORPAY_KEY_SECRET=JfbI1sSGRBL9M5OZZ7KgcbyL
```

## 🔧 Configuration

### Environment Variables

The following environment variables are required:

- `RAZORPAY_KEY_ID` - Your Razorpay API Key (Test/Live)
- `RAZORPAY_KEY_SECRET` - Your Razorpay API Secret (Test/Live)

### How It Works

1. **Payment Processing** (`/api/payment/process`):
   - Creates Razorpay order
   - Stores pending payment in database
   - Returns order details for frontend

2. **Payment Verification** (`/api/payment/verify`):
   - Verifies payment signature
   - Updates payment status to "completed"
   - Prevents duplicate processing

3. **Payment Management** (`/admin/payments`):
   - View all payments
   - Process refunds
   - Delete payment records

## 📝 Payment Flow

1. User submits tool with paid listing
2. Frontend calls `/api/payment/process`
3. Razorpay order created
4. User redirected to Razorpay checkout
5. After payment, Razorpay redirects back
6. Frontend calls `/api/payment/verify`
7. Payment verified and status updated

## 🔒 Security

- Keys are stored in `.env.local` (not committed to git)
- Payment signature verification prevents fraud
- Idempotency checks prevent duplicate processing
- Only admins can view/manage payments

## 🧪 Test Mode

Currently using **Test Keys**:
- Test cards: https://razorpay.com/docs/payments/test-cards/
- Test payments won't charge real money
- Use test card: `4111 1111 1111 1111`

## 🚀 Production Setup

When ready for production:

1. Get Live API keys from Razorpay Dashboard
2. Update `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_live_secret_key
   ```
3. Restart server
4. Test with real payments

## 📊 Payment Status

- `pending` - Order created, payment not completed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded by admin

## 🔄 Refund Process

1. Admin goes to `/admin/payments`
2. Selects completed payment
3. Clicks "Process Refund"
4. Enters refund amount and reason
5. Payment status updated to "refunded"
6. Metadata stored with refund details

## ⚠️ Important Notes

- **Never commit `.env.local` to git**
- **Test keys only work in test mode**
- **Live keys will process real payments**
- **Keep keys secure and private**

## 🐛 Troubleshooting

### Payment Not Processing

1. Check if keys are in `.env.local`
2. Verify server was restarted after adding keys
3. Check server console for errors
4. Verify Razorpay account is active

### Payment Verification Fails

1. Check signature verification logic
2. Verify order_id matches
3. Check if payment already processed
4. Review server logs for details

### Keys Not Found

1. Ensure `.env.local` exists in project root
2. Check variable names are correct
3. Restart development server
4. Check for typos in keys

