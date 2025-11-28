# 🧪 Test Payment Cards

Use these test card details to test the payment flow:

## ✅ Successful Payment

### Card 1 (Visa)
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

### Card 2 (Mastercard)
- **Card Number**: `5555 5555 5555 4444`
- **Expiry**: Any future date (e.g., `01/26`)
- **CVV**: Any 3 digits (e.g., `456`)
- **Name**: Any name

### Card 3 (American Express)
- **Card Number**: `3782 822463 10005`
- **Expiry**: Any future date (e.g., `03/27`)
- **CVV**: Any 3 digits (e.g., `789`)
- **Name**: Any name

---

## ❌ Test Validation Errors

### Invalid Card Number (too short)
- **Card Number**: `4242 4242 4242`
- **Expected**: "Invalid card number" error

### Invalid Expiry Format
- **Expiry**: `1225` (without slash)
- **Expected**: Auto-formats to `12/25`

### Invalid CVV (too short)
- **CVV**: `12`
- **Expected**: "Invalid CVV" error

---

## 💡 Testing Flow

1. **Free Listing Test**:
   - Select "Free Listing"
   - Click "Submit Tool for Review"
   - Should submit without payment modal

2. **Paid Listing Test**:
   - Select "Paid Listing"
   - Click "Proceed to Payment ($99)"
   - Payment modal opens
   - Use test card above
   - Click "Pay $99.00"
   - Payment processes
   - Modal closes
   - Tool submits automatically
   - Redirects to dashboard

---

## 🔐 Security Note

⚠️ **Important**: These are test cards for development only. The current implementation uses **mock payment processing**. 

In production:
- Never store actual card details
- Use PCI-compliant payment gateway (Stripe/Razorpay)
- Implement proper encryption
- Add fraud detection

