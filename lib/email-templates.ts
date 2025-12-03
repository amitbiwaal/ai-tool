interface ToolUpdate {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  pricing_type: string;
  status: string;
  updated_at: string;
  old_data?: {
    name?: string;
    tagline?: string;
    description?: string;
    pricing_type?: string;
  };
}

interface User {
  email: string;
  full_name?: string;
}

// Newsletter email template for all subscribers
export function getNewsletterToolUpdateTemplate(tool: ToolUpdate, baseUrl: string = "https://mostpopularaitools.com") {
  const changes = getChangesDescription(tool);

  return {
    subject: `🆕 Tool Updated: ${tool.name}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tool Updated: ${tool.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .tool-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0; background: #f8fafc; }
    .tool-name { font-size: 24px; font-weight: bold; color: #1a202c; margin-bottom: 8px; }
    .tool-tagline { font-size: 16px; color: #718096; margin-bottom: 16px; }
    .changes-section { background: #fef5e7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
    .changes-title { font-weight: bold; color: #92400e; margin-bottom: 8px; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
    .pricing-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🆕 Tool Updated!</h1>
      <p>We've updated one of our featured AI tools</p>
    </div>

    <div class="content">
      <div class="tool-card">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-tagline">${tool.tagline || 'Powerful AI Tool'}</div>
        <div class="pricing-badge">${formatPricingType(tool.pricing_type)}</div>
      </div>

      ${changes ? `
      <div class="changes-section">
        <div class="changes-title">📝 What Changed:</div>
        <div>${changes}</div>
      </div>
      ` : ''}

      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0;">
        ${tool.description ? tool.description.substring(0, 200) + (tool.description.length > 200 ? '...' : '') : 'Check out this amazing AI tool that can help boost your productivity!'}
      </p>

      <div style="text-align: center;">
        <a href="${baseUrl}/tools/${tool.slug}" class="cta-button">
          View Updated Tool →
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; margin-top: 30px;">
        Want to stop receiving these updates?
        <a href="${baseUrl}/newsletter/unsubscribe" style="color: #3b82f6;">Unsubscribe here</a>
      </p>
    </div>

    <div class="footer">
      <p>AI Tools Directory - Discover the Best AI Tools</p>
      <p>© 2025 Most Popular AI Tools. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Tool Updated: ${tool.name}

We've updated one of our featured AI tools!

Tool: ${tool.name}
Tagline: ${tool.tagline || 'Powerful AI Tool'}
Pricing: ${formatPricingType(tool.pricing_type)}

${changes ? `Changes: ${changes}` : ''}

${tool.description ? tool.description.substring(0, 200) + (tool.description.length > 200 ? '...' : '') : 'Check out this amazing AI tool!'}

View the updated tool: ${baseUrl}/tools/${tool.slug}

---
AI Tools Directory - Discover the Best AI Tools
Unsubscribe: ${baseUrl}/newsletter/unsubscribe
    `
  };
}

// User-specific email template for favorite/visited tools
export function getUserSpecificToolUpdateTemplate(tool: ToolUpdate, user: User, reason: 'favorite' | 'visited', baseUrl: string = "https://mostpopularaitools.com") {
  const changes = getChangesDescription(tool);
  const reasonText = reason === 'favorite' ? 'one of your favorite tools' : 'a tool you recently viewed';

  return {
    subject: `🔄 Update: ${tool.name} (${reason === 'favorite' ? 'Your Favorite' : 'Recently Viewed'})`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tool Updated: ${tool.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .tool-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0; background: #f0fdf4; }
    .tool-name { font-size: 24px; font-weight: bold; color: #1a202c; margin-bottom: 8px; }
    .tool-tagline { font-size: 16px; color: #718096; margin-bottom: 16px; }
    .changes-section { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
    .changes-title { font-weight: bold; color: #92400e; margin-bottom: 8px; }
    .personal-note { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
    .pricing-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 Personal Tool Update</h1>
      <p>One of your ${reasonText} has been updated!</p>
    </div>

    <div class="content">
      <div class="personal-note">
        <strong>Hi ${user.full_name || 'there'}!</strong><br>
        We noticed you've ${reason === 'favorite' ? 'added this tool to your favorites' : 'recently viewed this tool'}, so we wanted to let you know about the recent updates.
      </div>

      <div class="tool-card">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-tagline">${tool.tagline || 'Powerful AI Tool'}</div>
        <div class="pricing-badge">${formatPricingType(tool.pricing_type)}</div>
      </div>

      ${changes ? `
      <div class="changes-section">
        <div class="changes-title">📝 What Changed:</div>
        <div>${changes}</div>
      </div>
      ` : ''}

      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0;">
        ${tool.description ? tool.description.substring(0, 200) + (tool.description.length > 200 ? '...' : '') : 'Check out the latest updates to this AI tool!'}
      </p>

      <div style="text-align: center;">
        <a href="${baseUrl}/tools/${tool.slug}" class="cta-button">
          View Updated Tool →
        </a>
      </div>

      <p style="color: #718096; font-size: 14px; margin-top: 30px; text-align: center;">
        You received this because you ${reason === 'favorite' ? 'favorited' : 'viewed'} this tool.<br>
        <a href="${baseUrl}/settings/notifications" style="color: #059669;">Manage notification preferences</a>
      </p>
    </div>

    <div class="footer">
      <p>AI Tools Directory - Discover the Best AI Tools</p>
      <p>© 2025 Most Popular AI Tools. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Personal Tool Update: ${tool.name}

Hi ${user.full_name || 'there'}!

One of your ${reasonText} has been updated!

Tool: ${tool.name}
Tagline: ${tool.tagline || 'Powerful AI Tool'}
Pricing: ${formatPricingType(tool.pricing_type)}

${changes ? `Changes: ${changes}` : ''}

${tool.description ? tool.description.substring(0, 200) + (tool.description.length > 200 ? '...' : '') : 'Check out the latest updates!'}

View the updated tool: ${baseUrl}/tools/${tool.slug}

---
You received this because you ${reason === 'favorite' ? 'favorited' : 'viewed'} this tool.
Manage preferences: ${baseUrl}/settings/notifications

AI Tools Directory - Discover the Best AI Tools
    `
  };
}

// Helper function to get changes description
function getChangesDescription(tool: ToolUpdate): string | null {
  if (!tool.old_data) return null;

  const changes: string[] = [];

  if (tool.old_data.name && tool.old_data.name !== tool.name) {
    changes.push(`Name changed from "${tool.old_data.name}" to "${tool.name}"`);
  }

  if (tool.old_data.tagline && tool.old_data.tagline !== tool.tagline) {
    changes.push(`Tagline updated`);
  }

  if (tool.old_data.description && tool.old_data.description !== tool.description) {
    changes.push(`Description updated`);
  }

  if (tool.old_data.pricing_type && tool.old_data.pricing_type !== tool.pricing_type) {
    changes.push(`Pricing changed from ${formatPricingType(tool.old_data.pricing_type)} to ${formatPricingType(tool.pricing_type)}`);
  }

  return changes.length > 0 ? changes.join('. ') : null;
}

// Helper function to format pricing type
function formatPricingType(pricing: string): string {
  const pricingMap: Record<string, string> = {
    'free': 'Free',
    'freemium': 'Freemium',
    'paid': 'Paid',
    'subscription': 'Subscription',
    'one-time': 'One-time Purchase'
  };
  return pricingMap[pricing] || pricing;
}
