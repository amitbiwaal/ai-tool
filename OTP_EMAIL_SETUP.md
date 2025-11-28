# OTP Email Configuration Guide

Agar aapko email me **Magic Link** ke bajay **OTP Code (6-digit)** chahiye, to Supabase dashboard me email template configure karein.

## Supabase Dashboard Configuration

### Step 1: Supabase Dashboard me jayein

1. [Supabase Dashboard](https://supabase.com/dashboard) me login karein
2. Apna project select karein
3. Left sidebar se **Authentication** → **Email Templates** par click karein

### Step 2: "Magic Link" Template Update Karein

1. **"Magic Link"** template select karein
2. Template ko update karein to show OTP code prominently

#### Default Template (Magic Link):
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

#### Updated Template (OTP Code Display):
```html
<h2>Your OTP Code</h2>
<p>Use this 6-digit code to verify your email:</p>
<div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
  <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; margin: 0;">
    {{ .Token }}
  </h1>
</div>
<p><strong>Note:</strong> This code will expire in 1 hour.</p>
<p>Or click this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In with Magic Link</a></p>
```

### Step 3: "Confirm signup" Template Update (For Signup)

Agar signup me bhi OTP chahiye:

1. **"Confirm signup"** template select karein
2. Similar template use karein with OTP code display

```html
<h2>Verify Your Email - OTP Code</h2>
<p>Thank you for signing up! Use this 6-digit code to verify your email:</p>
<div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
  <h1 style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: white; margin: 0;">
    {{ .Token }}
  </h1>
</div>
<p><strong>Important:</strong> This code will expire in 1 hour.</p>
<p>Or click this link to confirm your signup:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Signup</a></p>
```

### Step 4: Save Changes

1. Template me changes karne ke baad **"Save"** button click karein
2. Ab test email send karein to verify

## Important Notes

- **{{ .Token }}** - Ye variable automatically 6-digit OTP code contain karta hai
- **{{ .ConfirmationURL }}** - Ye magic link URL hai (optional, agar magic link bhi rakhna hai)
- OTP code automatically generate hota hai when you use `signInWithOtp()`
- Email me dono OTP code aur magic link rakh sakte hain (user choice ke liye)

## Testing

1. Signup ya login page se OTP request karein
2. Email check karein
3. OTP code dikhna chahiye email me
4. OTP code ko verify-otp page me enter karein

## Alternative: Custom Email Service

Agar Supabase email templates se kaam nahi chalta, to aap:
- Custom email service use kar sakte hain (SendGrid, Resend, etc.)
- Or Supabase Edge Functions se custom email send kar sakte hain

## Troubleshooting

**Issue:** OTP code email me nahi aa raha
- **Solution:** Check Supabase email template - ensure `{{ .Token }}` variable use ho rahi hai

**Issue:** Magic link aa raha hai but OTP nahi
- **Solution:** Template update karein aur `{{ .Token }}` prominently display karein

**Issue:** Email hi nahi aa raha
- **Solution:** 
  1. Check Supabase project settings
  2. Verify email authentication enabled hai
  3. Check spam folder
  4. Development me, Supabase dashboard → Authentication → Users me emails check karein

**Issue:** "Token has expired or is invalid" error
- **Solution:** 
  1. **OTP Expire ho gaya:** OTP 1 hour ke liye valid hota hai. Fresh OTP request karein using "Resend OTP" button
  2. **Wrong OTP entered:** Ensure correct 6-digit code enter karein
  3. **Type mismatch:** Code automatically handles this - signup flow me `type: "signup"` use hota hai, login me `type: "email"`
  4. **Email mismatch:** Ensure same email use karein jo OTP request me use ki thi
  5. **OTP already used:** Har OTP sirf ek baar use hota hai. Naya OTP request karein
  6. **Page refresh:** Agar page refresh kiya ya tab close kiya, to OTP expire ho sakta hai. Naya OTP request karein

**Important:** 
- OTP code immediately use karein after receiving (within 1 hour)
- Don't refresh page ya navigate away before verifying
- Ensure correct email address use karein
- Agar error aaye, "Resend OTP" button use karein (60 seconds cooldown ke baad)

