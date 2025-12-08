const nodemailer = require('nodemailer');

const createGmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Gmail credentials not configured. Using test email service instead.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const createEtherealTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Failed to create Ethereal test account:', error);
    throw new Error('Could not initialize test email service');
  }
};


const createResetEmailTemplate = (resetToken, username) => {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EstateElite</h1>
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hello ${username},</p>
          <p>You requested to reset your password for your EstateElite account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px; border: 1px solid #e2e8f0;">
            ${resetLink}
          </p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 EstateElite. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.sendPasswordResetEmail = async (email, username, resetToken) => {
  let transporter;
  let usingTestService = false;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        transporter = createGmailTransporter();
        console.log('Using Gmail service for email');
      } catch (gmailError) {
        console.warn('Gmail configuration failed, falling back to test service:', gmailError.message);
        transporter = await createEtherealTransporter();
        usingTestService = true;
      }
    } else {
      transporter = await createEtherealTransporter();
      usingTestService = true;
      console.log('No Gmail config found, using test email service');
    }

    const mailOptions = {
      from: usingTestService ? '"EstateElite" <noreply@estateelite.com>' : process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your EstateElite Password',
      html: createResetEmailTemplate(resetToken, username),
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (usingTestService) {
      const previewUrl = nodemailer.getTestMessageUrl(result);
      console.log('Test email sent! Preview URL:', previewUrl);
      console.log('Reset token (for testing):', resetToken);
      
      return { 
        success: true, 
        messageId: result.messageId,
        previewUrl: previewUrl,
        usingTestService: true,
        resetToken: resetToken 
      };
    } else {
      console.log('Password reset email sent successfully to:', email);
      return { 
        success: true, 
        messageId: result.messageId,
        usingTestService: false
      };
    }
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    if (error.message.includes('Invalid login')) {
      throw new Error('Email service authentication failed. Please check your email credentials.');
    } else if (error.message.includes('ENOTFOUND')) {
      throw new Error('Unable to connect to email service. Please check your internet connection.');
    } else {
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }
};
exports.sendTestEmail = async (email, username, resetToken) => {
  try {
    const transporter = await createEtherealTransporter();

    const mailOptions = {
      from: '"EstateElite" <noreply@estateelite.com>',
      to: email,
      subject: 'Reset Your EstateElite Password',
      html: createResetEmailTemplate(resetToken, username),
    };

    const result = await transporter.sendMail(mailOptions);
    
    const previewUrl = nodemailer.getTestMessageUrl(result);
    console.log('🔐 Password Reset Information:');
    console.log('📧 Email sent to:', email);
    console.log('🔗 Reset Link:', `http://localhost:5173/reset-password?token=${resetToken}`);
    console.log('👀 Email Preview:', previewUrl);
    console.log('🗝️ Reset Token:', resetToken);
    
    return { 
      success: true, 
      messageId: result.messageId,
      previewUrl: previewUrl,
      resetToken: resetToken
    };
    
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error('Failed to send test email: ' + error.message);
  }
};