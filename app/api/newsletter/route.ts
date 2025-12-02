import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Generate a secure verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        error: "Database connection not available. Please configure Supabase environment variables."
      }, { status: 503 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = newsletterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid email address',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check if email is already subscribed
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing subscriber:', checkError);
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      );
    }

    if (existingSubscriber) {
      if (existingSubscriber.status === 'verified') {
        return NextResponse.json({
          message: 'You are already subscribed to our newsletter!',
          alreadySubscribed: true
        });
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate subscription
        const verificationToken = generateVerificationToken();
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'pending',
            verification_token: verificationToken,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
          );
        }

        // TODO: Send verification email
        return NextResponse.json({
          message: 'Subscription reactivated! Please check your email to verify.',
          verificationSent: true
        });
      }
    }

    // Create new subscription
    const verificationToken = generateVerificationToken();
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        status: 'pending',
        verification_token: verificationToken
      });

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // TODO: Send verification email
    return NextResponse.json({
      message: 'Thank you for subscribing! Please check your email to verify your subscription.',
      verificationSent: true
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify subscription
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        error: "Database connection not available. Please configure Supabase environment variables."
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const { data: subscriber, error: verifyError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verification_token: null
      })
      .eq('verification_token', token)
      .select('email')
      .single();

    if (verifyError || !subscriber) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Return success page
    return new Response(
      `
<!DOCTYPE html>
<html>
<head>
  <title>Email Verified - AI Tools Directory</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .success { color: #10b981; font-size: 48px; text-align: center; margin-bottom: 20px; }
    h1 { color: #1f2937; text-align: center; margin-bottom: 20px; }
    p { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
    .button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">✓</div>
    <h1>Email Verified Successfully!</h1>
    <p>Thank you for verifying your email address. You are now subscribed to our newsletter and will receive the latest AI tools and insights delivered to your inbox.</p>
    <p>You can now close this page and continue browsing.</p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="/" class="button">Continue to Homepage</a>
    </div>
  </div>
</body>
</html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    console.error('Newsletter verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
