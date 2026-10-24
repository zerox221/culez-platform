exports.getOtpEmail = (otp, username)=>{
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;max-width:420px;">
      <div style="font-size:21px;font-weight:700;letter-spacing:-0.5px;margin-bottom:14px;">
        Culez<span style="color:#6366f1;">.</span>
      </div>

      <p style="margin:0 0 6px;font-size:16px;font-weight:600;">
        Hey ${username || "there"},
      </p>

      <p style="margin:0 0 14px;font-size:13px;color:#555;">
        Use the verification code below to securely access your Culez college community.
      </p>

      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:14px;margin-bottom:10px;">
        <p style="margin:0 0 5px;font-size:10px;font-weight:600;letter-spacing:1.5px;color:#777;">
          YOUR VERIFICATION CODE
        </p>
        <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:6px;color:#111;">
          ${otp}
        </p>
      </div>

      <p style="margin:0 0 14px;font-size:11px;color:#777;">
        Expires in 2 minutes. Don't share this code with anyone.
      </p>

      <p style="margin:0 0 14px;font-size:12px;color:#555;">
        If you didn't request this code, you can safely ignore this email.
      </p>

      <p style="margin:0;font-size:12px;color:#444;">
        Thanks,<br>
        <strong>Team Culez</strong>
      </p>

      <p style="margin:14px 0 0;padding-top:8px;border-top:1px solid #eee;font-size:10px;color:#999;">
        Your campus. Your community. Your Culez.
      </p>
    </div>
  `;
}


exports.getForgotPasswordEmail = (url, username) => {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;max-width:420px;">
      <div style="font-size:21px;font-weight:700;margin-bottom:14px;">
        Culez<span style="color:#6366f1;">.</span>
      </div>

      <p style="margin:0 0 6px;font-size:16px;font-weight:600;">
        Hey ${username || "there"},
      </p>

      <p style="margin:0 0 14px;font-size:13px;color:#555;">
        We received a request to reset your Culez account password.
        Click the button below to create a new password.
      </p>

      <div style="margin:18px 0;">
        <a href="${url}"
          style="display:inline-block;padding:10px 18px;background:#6366f1;
          color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;
          border-radius:5px;">
          Reset Password
        </a>
      </div>

      <p style="margin:0 0 14px;font-size:11px;color:#777;">
        This link expires in 15 minutes and can only be used once.
      </p>

      <p style="margin:0 0 12px;font-size:12px;color:#555;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </p>

      <p style="margin:0;font-size:12px;">
        Thanks,<br><strong>Team Culez</strong>
      </p>

      <p style="margin:14px 0 0;padding-top:8px;border-top:1px solid #eee;font-size:10px;color:#999;">
        Your campus. Your community. Your Culez.
      </p>
    </div>
  `;
};
