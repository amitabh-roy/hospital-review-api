export const getBaseHtmlTemplate = (
  content: string,
  ctaText?: string,
  ctaLink?: string,
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); }
    .header { background-color: #0f172a; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px 32px; color: #334155; line-height: 1.6; font-size: 16px; }
    .content p { margin: 0 0 16px 0; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .footer { background-color: #f8fafc; padding: 32px 24px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 8px 0 0 0; }
    .text-muted { color: #94a3b8; font-size: 13px; }
    .fallback-link { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OpenCurtain</h1>
    </div>
    <div class="content">
      ${content}
      ${
        ctaText && ctaLink
          ? `<div class="button-container"><a href="${ctaLink}" class="button">${ctaText}</a></div>
             <p class="fallback-link">If the button doesn't work, copy and paste this link into your browser:<br><a href="${ctaLink}">${ctaLink}</a></p>`
          : ''
      }
      <p><br>— The OpenCurtain Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} OpenCurtain. All rights reserved.</p>
      <p class="text-muted">You are receiving this email because you opted in via our website or app.</p>
    </div>
  </div>
</body>
</html>
  `;
};
