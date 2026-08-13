import { getBaseHtmlTemplate } from './base.template';

export const getContactSubmissionTemplate = (
  firstName: string,
  lastName: string,
  email: string,
  topic: string | null,
  message: string,
) => {
  const name = `${firstName} ${lastName}`.trim();
  const subject = `OpenCurtain contact: ${topic?.trim() || 'General'}`;
  const text = `New contact form submission\n\nFrom: ${name} <${email}>\nTopic: ${
    topic?.trim() || 'General'
  }\n\n${message.trim()}`;
  const html = `
    <h2>New Contact Submission</h2>
    <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
    <p><strong>Topic:</strong> ${topic?.trim() || 'General'}</p>
    <hr>
    <p style="white-space: pre-wrap;">${message.trim()}</p>
  `;

  return { subject, text, html };
};

export const getContactAutoReplyTemplate = (firstName: string) => {
  const greeting = firstName.trim() ? `Hi ${firstName.trim()},` : 'Hi,';
  const text = `${greeting}\n\nThanks for contacting OpenCurtain. We received your message and will get back to you soon.\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>${greeting}</p><p>Thanks for contacting OpenCurtain. We have successfully received your message.</p><p>Our team will review your inquiry and get back to you as soon as possible.</p>`,
  );

  return { subject: 'We received your message — OpenCurtain', text, html };
};

export const getContactReplyEmailTemplate = (
  firstName: string,
  reply: string,
) => {
  const greeting = firstName.trim() ? `Hi ${firstName.trim()},` : 'Hi,';
  const text = `${greeting}\n\n${reply.trim()}\n\n— The OpenCurtain Team`;
  const html = getBaseHtmlTemplate(
    `<p>${greeting}</p><p style="white-space: pre-wrap;">${reply.trim()}</p>`,
  );

  return { subject: 'Reply from OpenCurtain', text, html };
};
