export const adminRegisterTemplate = ({ fullName }) => `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #2c3e50; margin-bottom: 16px;">Welcome, ${
      fullName || "User"
    }!</h2>
    
    <p style="color: #333; font-size: 16px; line-height: 1.5;">
      You've been registered by an administrator to access the <strong>Imria Health</strong> portal.
    </p>

    <p style="color: #333; font-size: 16px; line-height: 1.5;">
      To get started, please set your password by clicking the button below:
    </p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${process.env.CLIENT_BASE_PATH}/forgot-password"
         style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
         Set Your Password
      </a>
    </p>

    <p style="color: #777; font-size: 14px; line-height: 1.5;">
      After setting your password, you can log in anytime at 
      <a href="${
        process.env.CLIENT_BASE_PATH
      }" target="_blank" style="color: #007BFF;">the login portal</a>.
    </p>

    <p style="color: #aaa; font-size: 12px; margin-top: 30px;">
      If you were not expecting this email, please ignore it.
    </p>
  </div>
`;

export const sentInvite = ({ fullName }) =>
  ` <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 20px; background-color: #f4f6f8; font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="text-align: center; margin-bottom: 20px;">Welcome to Imria Health</h2>
          <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
          <p style="font-size: 16px;">You’ve been invited to register on our platform. Click the button below to complete your registration and gain access to your patient dashboard.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_BASE_PATH}"
              style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: bold;">
              Complete Registration
            </a>
          </div>
          <p style="font-size: 14px;">If you did not expect this invitation, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">
            &copy; ${new Date().getFullYear()} Imria Health. All rights reserved.
          </p>
        </div>
      </body>
    </html>  
`;

export const forgotPasswordWeb = ({ fullName, resetLink }) =>
  `  <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Hi ${fullName},</h2>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 16px; background: #007BFF; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </p>
        <p style="font-size: 12px; color: #888;">If you didn't request this, you can ignore this email.</p>
    </div>
`;

export const sentOtpMail = ({fullName,otp}) =>
  ` <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Hi ${fullName},</h2>
        <p>Your verification code is:</p>
        <h3 style="color: #007BFF;">${otp}</h3>
        <p style="font-size: 12px; color: #888;">This code will expire in 10 minutes. Do not share it with anyone.</p>
      </div>
`;

export const forgotPasswordMobile = ({ fullName, otp }) =>
  ` <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Hi ${fullName || 'User'},</h2>
        <p>You requested to reset your password. Use the OTP code below to proceed:</p>
        <h3 style="color: #007BFF;">${otp}</h3>
        <p style="font-size: 12px; color: #888;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      </div>
`;
