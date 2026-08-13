import { getBaseHtmlTemplate } from './base.template';

export const getReviewSubmittedEmailTemplate = (hospitalName: string) => {
  const text = `Thank you for submitting your review${
    hospitalName ? ` of ${hospitalName}` : ''
  }.\n\nOur team will review your submission and credential verification. You will receive another email once your review has been reviewed.\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>Hi there,</p><p>Thank you for submitting your review${
      hospitalName ? ` of <strong>${hospitalName}</strong>` : ''
    }.</p><p>Our team will carefully review your submission along with your credential verification. You will receive another email from us once your review has been processed.</p>`,
  );

  return { subject: 'Your OpenCurtain review was received', text, html };
};

export const getReviewApprovedEmailTemplate = (hospitalName: string) => {
  const text = `Good news — your review${
    hospitalName ? ` of ${hospitalName}` : ''
  } has been approved and is now visible on OpenCurtain.\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>Hi there,</p><p>Good news — your review${
      hospitalName ? ` of <strong>${hospitalName}</strong>` : ''
    } has been approved and is now visible on OpenCurtain.</p><p>Thank you for contributing to our community!</p>`,
  );

  return { subject: 'Your OpenCurtain review was approved', text, html };
};

export const getReviewRejectedEmailTemplate = (hospitalName: string) => {
  const text = `Your review${
    hospitalName ? ` of ${hospitalName}` : ''
  } was not approved at this time. You can submit an updated review if you believe this was in error.\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>Hi there,</p><p>Your review${
      hospitalName ? ` of <strong>${hospitalName}</strong>` : ''
    } was not approved at this time.</p><p>You can submit an updated review if you believe this was in error or if you have corrected the issues.</p>`,
  );

  return { subject: 'Update on your OpenCurtain review', text, html };
};

export const getReviewFeedbackEmailTemplate = (
  hospitalName: string,
  feedback: string,
) => {
  const text = `Our team reviewed your submission${
    hospitalName ? ` for ${hospitalName}` : ''
  } and needs a revision before it can be published.\n\nFeedback:\n${feedback.trim()}\n\nSign in to your account to edit and resubmit your review.\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>Hi there,</p><p>Our team reviewed your submission${
      hospitalName ? ` for <strong>${hospitalName}</strong>` : ''
    } and needs a revision before it can be published.</p><div style="background-color: #f1f5f9; padding: 16px; border-left: 4px solid #3b82f6; margin: 16px 0; border-radius: 4px;"><strong>Feedback:</strong><br>${feedback
      .trim()
      .replace(/\n/g, '<br>')}</div><p>Please sign in to your account to edit and resubmit your review.</p>`,
  );

  return { subject: 'Feedback on your OpenCurtain review', text, html };
};
