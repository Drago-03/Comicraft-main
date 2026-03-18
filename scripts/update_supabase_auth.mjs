import fs from "fs";

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "nipmqxecwnzwsmfrrkpl";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const confirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Comicraft</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0d12; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; padding: 40px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #2a2a35; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 24px; color: #fff; text-decoration: none; }
    .logo span { color: #8b5cf6; } 
    .title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #ededed; }
    .message { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4); text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { margin-top: 40px; font-size: 13px; color: #52525b; border-top: 1px solid #2a2a35; padding-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Comi<span>craft</span></div>
    <h1 class="title">Welcome to the Universe</h1>
    <p class="message">You're just one step away from joining Comicraft, the Creative Tokenization Platform. Please verify your email address to activate your account and start your journey.</p>
    <a href="{{ .ConfirmationURL }}" class="btn">Verify Email Address</a>
    <p class="footer">If you didn't request this email, there's nothing to worry about — you can safely ignore it.<br>&copy; 2026 Comicraft. All rights reserved.</p>
  </div>
</body>
</html>
`;

const resetTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Comicraft</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #0d0d12; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; padding: 40px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #2a2a35; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; margin-bottom: 24px; color: #fff; }
    .logo span { color: #8b5cf6; }
    .title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #ededed; }
    .message { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4); text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { margin-top: 40px; font-size: 13px; color: #52525b; border-top: 1px solid #2a2a35; padding-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Comi<span>craft</span></div>
    <h1 class="title">Reset Your Password</h1>
    <p class="message">We received a request to reset the password for your Comicraft account. Click the button below to set up a new password for your account.</p>
    <a href="{{ .ConfirmationURL }}" class="btn">Reset Password</a>
    <p class="footer">If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.<br>&copy; 2026 Comicraft. All rights reserved.</p>
  </div>
</body>
</html>
`;

const magicLinkTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login to Comicraft</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #0d0d12; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; padding: 40px; background-color: #1a1a24; border-radius: 12px; border: 1px solid #2a2a35; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; margin-bottom: 24px; color: #fff; }
    .logo span { color: #8b5cf6; }
    .title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #ededed; }
    .message { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 32px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { margin-top: 40px; font-size: 13px; color: #52525b; border-top: 1px solid #2a2a35; padding-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Comi<span>craft</span></div>
    <h1 class="title">Your Magic Link</h1>
    <p class="message">Click the button below to securely login to your Comicraft account. No password required.</p>
    <a href="{{ .ConfirmationURL }}" class="btn">Secure Login</a>
    <p class="footer">If you didn't request this Magic Link, you can safely ignore this email.<br>&copy; 2026 Comicraft. All rights reserved.</p>
  </div>
</body>
</html>
`;

const authConfigPayload = {
  // SMTP settings
  external_email_enabled: true,
  mailer_secure_email_change_enabled: true,
  mailer_autoconfirm: false,
  smtp_admin_email: "noreply@comicraft.com",
  smtp_host: "smtp.resend.com",
  smtp_port: "465",
  smtp_user: "resend",
  smtp_pass: process.env.RESEND_API_KEY,
  smtp_sender_name: "Comicraft",

  // Custom Email Templates
  mailer_templates_confirmation_content: confirmationTemplate,
  mailer_templates_recovery_content: resetTemplate,
  mailer_templates_magic_link_content: magicLinkTemplate,
  mailer_templates_invite_content: confirmationTemplate, // reusing signup for invite
};

async function updateSupabaseConfig() {
  console.log('Sending PATCH request to Supabase API...');

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/config/auth`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(authConfigPayload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to update config:', res.status, errorText);
    process.exit(1);
  }

  const successData = await res.json();
  console.log('Successfully updated the configuration!');
  console.log('Resulting SMTP Host:', successData.smtp_host);
}

updateSupabaseConfig().catch(err => {
  console.error(err);
  process.exit(1);
});
