import crypto from 'crypto';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  channel: 'sms' | 'whatsapp';
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const store = new Map<string, OtpRecord>();

function normalize(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function requestOtp(phone: string, channel: 'sms' | 'whatsapp' = 'sms'): string {
  const key = `${channel}:${normalize(phone)}`;
  const code = ('' + Math.floor(100000 + Math.random() * 900000));
  store.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    channel,
  });

  // Delivery stub: in dev we log the OTP so it shows up in the backend console.
  // In production wire this to a real SMS provider (Twilio / MSG91) for `sms`
  // or the WhatsApp Business API for `whatsapp`.
  // eslint-disable-next-line no-console
  console.log(`[OTP] ${channel.toUpperCase()} -> ${phone}: ${code}`);

  return code;
}

export function verifyOtp(phone: string, code: string, channel: 'sms' | 'whatsapp' = 'sms'): boolean {
  const key = `${channel}:${normalize(phone)}`;
  const record = store.get(key);
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return false;
  }
  record.attempts += 1;
  const ok = crypto.timingSafeEqual(Buffer.from(record.code), Buffer.from(code));
  if (ok) store.delete(key);
  return ok;
}

export function peekOtp(phone: string, channel: 'sms' | 'whatsapp' = 'sms'): string | null {
  // Dev helper: lets you read the current code from logs in dev mode.
  const record = store.get(`${channel}:${normalize(phone)}`);
  return record?.code ?? null;
}