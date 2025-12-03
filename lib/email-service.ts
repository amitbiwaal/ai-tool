import nodemailer, { Transporter } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

// Email service class
export class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;
  private initialized: boolean = false;

  constructor() {
    // Initialize asynchronously when first used
  }

  private async initializeTransporter() {
    try {
      // First, try to get SMTP configuration from environment variables
      let smtpHost = process.env.SMTP_HOST;
      let smtpPort = parseInt(process.env.SMTP_PORT || '587');
      let smtpUser = process.env.SMTP_USER;
      let smtpPass = process.env.SMTP_PASS;
      let fromEmail = process.env.SMTP_FROM || 'noreply@mostpopularaitools.com';

      // Try to get SMTP host, port, and from email from database settings
      // (user/pass are kept in environment variables for security)
      try {
        const { createServerSupabaseClient } = await import('@/lib/supabase/server');
        const supabase = await createServerSupabaseClient();

        if (supabase) {
          // Get admin settings from database
          const { data: settings, error } = await supabase
            .from('admin_settings')
            .select('settings')
            .eq('key', 'email')
            .single();

          if (!error && settings?.settings) {
            const emailSettings = settings.settings;
            smtpHost = smtpHost || emailSettings.smtpHost;
            smtpPort = smtpPort || parseInt(emailSettings.smtpPort) || 587;
            fromEmail = fromEmail || emailSettings.fromEmail || 'noreply@mostpopularaitools.com';

            console.log('SMTP configuration (host/port) loaded from database settings');
          }
        }
      } catch (dbError) {
        console.error('Failed to load SMTP settings from database:', dbError);
      }

      // If we have SMTP configuration (from env or database)
      if (smtpHost && smtpUser && smtpPass) {
        this.config = {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        };

        this.transporter = nodemailer.createTransport(this.config);
        console.log('Email service initialized with SMTP configuration');
      } else {
        console.warn('SMTP configuration not found in environment variables or database');
        console.warn('Please configure SMTP settings in admin panel or environment variables');
        console.warn('Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (or admin settings)');
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  // Send a single email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Ensure transporter is initialized
      if (!this.initialized) {
        await this.initializeTransporter();
        this.initialized = true;
      }

      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }

      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || `noreply@mostpopularaitools.com`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send bulk emails (with rate limiting)
  async sendBulkEmails(emails: EmailOptions[], batchSize: number = 10): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Process emails in batches to avoid overwhelming the SMTP server
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const promises = batch.map(email => this.sendEmail(email));
      const results = await Promise.all(promises);

      success += results.filter(result => result).length;
      failed += results.filter(result => !result).length;

      // Small delay between batches to be respectful to SMTP server
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { success, failed };
  }

  // Test email functionality
  async testEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Test Email - AI Tools Directory',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email from your AI Tools Directory.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `,
      text: 'Test email from AI Tools Directory. If you received this, your email configuration is working correctly!'
    });
  }

  // Check if email service is properly configured
  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

// Utility functions for tool update notifications
export async function sendNewsletterToolUpdate(toolData: any, baseUrl?: string) {
  const emailService = getEmailService();

  if (!emailService.isConfigured()) {
    console.warn('Email service not configured, skipping newsletter notifications');
    return { success: 0, failed: 0 };
  }

  try {
    // Import Supabase client to get newsletter subscribers
    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      console.error('Failed to initialize Supabase client for newsletter');
      return { success: 0, failed: 0 };
    }

    // Get all verified newsletter subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'verified');

    if (error || !subscribers || subscribers.length === 0) {
      console.log('No newsletter subscribers found or error:', error?.message);
      return { success: 0, failed: 0 };
    }

    console.log(`Sending tool update notification to ${subscribers.length} newsletter subscribers`);

    // Import email template
    const { getNewsletterToolUpdateTemplate } = await import('@/lib/email-templates');
    const template = getNewsletterToolUpdateTemplate(toolData, baseUrl);

    // Create email options for all subscribers
    const emailOptions: EmailOptions[] = subscribers.map(subscriber => ({
      to: subscriber.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }));

    // Send bulk emails
    const result = await emailService.sendBulkEmails(emailOptions, 20); // Send in batches of 20
    console.log(`Newsletter notifications sent: ${result.success} success, ${result.failed} failed`);

    return result;
  } catch (error) {
    console.error('Failed to send newsletter notifications:', error);
    return { success: 0, failed: 1 };
  }
}

export async function sendUserSpecificToolUpdate(toolData: any, userEmails: string[], reason: 'favorite' | 'visited', baseUrl?: string) {
  const emailService = getEmailService();

  if (!emailService.isConfigured()) {
    console.warn('Email service not configured, skipping user-specific notifications');
    return { success: 0, failed: 0 };
  }

  try {
    // Import Supabase client to get user details
    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      console.error('Failed to initialize Supabase client for user notifications');
      return { success: 0, failed: 0 };
    }

    // Get user details for the emails
    const { data: users, error } = await supabase
      .from('profiles')
      .select('email, full_name')
      .in('email', userEmails);

    if (error || !users || users.length === 0) {
      console.log('No user profiles found for emails or error:', error?.message);
      return { success: 0, failed: 0 };
    }

    console.log(`Sending user-specific tool update notification to ${users.length} users`);

    // Import email template
    const { getUserSpecificToolUpdateTemplate } = await import('@/lib/email-templates');

    // Create email options for each user
    const emailOptions: EmailOptions[] = users.map(user => {
      const template = getUserSpecificToolUpdateTemplate(toolData, user, reason, baseUrl);
      return {
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };
    });

    // Send bulk emails
    const result = await emailService.sendBulkEmails(emailOptions, 10); // Smaller batches for personalized emails
    console.log(`User-specific notifications sent: ${result.success} success, ${result.failed} failed`);

    return result;
  } catch (error) {
    console.error('Failed to send user-specific notifications:', error);
    return { success: 0, failed: 1 };
  }
}

// Background job to process email queue (can be called periodically)
export async function processEmailQueue() {
  // This could be enhanced to use a proper job queue system like Bull or similar
  console.log('Email queue processing not implemented yet');
  // TODO: Implement email queue processing for failed emails
}
