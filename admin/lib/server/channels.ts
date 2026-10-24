import type { Messaging } from 'firebase-admin/messaging';
import type { Msg } from './messages';

export type ChannelResult = 'sent' | 'skipped' | 'failed';

export async function sendPush(
  messaging: Messaging | null,
  token: string | undefined,
  msg: Msg,
  data: Record<string, string>,
): Promise<ChannelResult> {
  if (!messaging || !token) return 'skipped';
  try {
    await messaging.send({
      token,
      notification: { title: msg.title, body: msg.body },
      data,
      android: { priority: 'high', notification: { channelId: 'orders' } },
    });
    return 'sent';
  } catch {
    return 'failed';
  }
}

export async function sendEmail(
  to: { email?: string; name?: string },
  msg: Msg,
): Promise<ChannelResult> {
  const service_id = process.env.EMAILJS_SERVICE_ID;
  const template_id = process.env.EMAILJS_TEMPLATE_ID;
  const user_id = process.env.EMAILJS_PUBLIC_KEY;
  const accessToken = process.env.EMAILJS_PRIVATE_KEY;
  if (!service_id || !template_id || !user_id || !accessToken || !to.email) return 'skipped';
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id,
        template_id,
        user_id,
        accessToken,
        template_params: {
          to_email: to.email,
          to_name: to.name || 'Customer',
          subject: msg.title + ' - Nirmal Aqua',
          message: msg.body,
        },
      }),
    });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

export async function sendSms(phone: string | undefined, msg: Msg): Promise<ChannelResult> {
  const key = process.env.TEXTBEE_API_KEY;
  const device = process.env.TEXTBEE_DEVICE_ID;
  if (!key || !device || !phone) return 'skipped';
  const digits = phone.replace(/[^\d+]/g, '');
  const recipient = digits.startsWith('+') ? digits : digits.length === 10 ? `+91${digits}` : `+${digits}`;
  try {
    const res = await fetch(
      `https://api.textbee.dev/api/v1/gateway/devices/${encodeURIComponent(device)}/send-sms`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key },
        body: JSON.stringify({ recipients: [recipient], message: `Nirmal Aqua: ${msg.body}` }),
      },
    );
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
