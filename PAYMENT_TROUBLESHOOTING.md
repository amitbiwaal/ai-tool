# Payment Processing Troubleshooting Guide

## Common Errors and Solutions

### Error: "Payment processing failed"

#### 1. Check Razorpay Package Installation

```bash
# Verify package is installed
npm list razorpay

# If not found, install it
npm install razorpay

# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm install razorpay
```

#### 2. Check Environment Variables

Verify `.env.local` has:
```
RAZORPAY_KEY_ID=rzp_test_RktD6xekngGnnZ
RAZORPAY_KEY_SECRET=JfbI1sSGRBL9M5OZZ7KgcbyL
```

**Important:**
- No quotes around values
- No extra spaces
- Server must be restarted after adding keys

#### 3. Check Server Console

Look for detailed error messages in server terminal:
- Razorpay import errors
- API key validation errors
- Network errors
- Database errors

#### 4. Common Issues

**Issue: Module not found**
- Solution: `npm install razorpay` and restart server

**Issue: Invalid API key**
- Solution: Verify keys in `.env.local` and restart server

**Issue: Network error**
- Solution: Check internet connection and Razorpay service status

**Issue: Database error**
- Solution: Check Supabase connection and payments table exists

### Error: "Payment gateway module not available"

This means Razorpay package is not installed or not loading properly.

**Solution:**
1. Install package: `npm install razorpay`
2. Clear Next.js cache: Delete `.next` folder
3. Restart server: `npm run dev`

### Error: "Payment gateway not configured"

This means API keys are missing or invalid.

**Solution:**
1. Check `.env.local` file exists
2. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
3. Restart server after adding keys
4. Check for typos in keys

### Error: "Failed to create payment order"

This is a Razorpay API error. Check:

1. **API Keys are correct:**
   - Test keys start with `rzp_test_`
   - Live keys start with `rzp_live_`

2. **Account Status:**
   - Razorpay account is active
   - Test mode is enabled (for test keys)

3. **Amount Validation:**
   - Minimum amount: ₹1 (100 paise)
   - Maximum amount: As per Razorpay limits

### Debugging Steps

1. **Check Server Logs:**
   - Look for detailed error messages
   - Check Razorpay API responses

2. **Test API Keys:**
   - Verify keys in Razorpay Dashboard
   - Test with Razorpay API directly

3. **Check Network:**
   - Browser DevTools → Network tab
   - Check `/api/payment/process` request
   - See response error details

4. **Verify Database:**
   - Check `payments` table exists
   - Verify RLS policies allow inserts

### Test Payment Flow

1. Go to `/submit` page
2. Fill tool form
3. Select "Paid Listing"
4. Click "Proceed to Payment"
5. Check browser console for errors
6. Check server console for errors

### Expected Behavior

**Success Flow:**
1. User clicks "Pay"
2. Frontend calls `/api/payment/process`
3. Backend creates Razorpay order
4. Returns order details
5. Razorpay checkout opens
6. User completes payment
7. Frontend calls `/api/payment/verify`
8. Payment verified and saved

**Error Flow:**
1. Error occurs at any step
2. Error message shown to user
3. Detailed error logged in server console
4. User can retry payment

### Getting Help

If issue persists:
1. Check server console for full error
2. Check browser console for frontend errors
3. Verify all environment variables
4. Test Razorpay keys in Razorpay Dashboard
5. Check Razorpay documentation

