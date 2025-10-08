import https from 'node:https';
import jwt from 'jsonwebtoken';

type PushParams = {
  platform: 'ios' | 'android';
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendPushToToken(params: PushParams) {
  if (params.platform === 'android') {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: params.token,
        notification: { title: params.title, body: params.body },
        data: params.data ?? {},
      }),
    });
    if (!res.ok) throw new Error(`FCM error: ${res.status}`);
    return { ok: true };
  }

  // APNS HTTP/2 token-based authentication
  const teamId = process.env.APNS_TEAM_ID!;
  const keyId = process.env.APNS_KEY_ID!;
  const bundleId = process.env.APNS_BUNDLE_ID!;
  const privateKey = (process.env.APNS_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    issuer: teamId,
    header: { alg: 'ES256', kid: keyId },
    expiresIn: '20m',
  });

  const payload = JSON.stringify({
    aps: { alert: { title: params.title, body: params.body }, sound: 'default' },
    ...(params.data ?? {}),
  });

  const req = https.request(
    {
      method: 'POST',
      host: 'api.sandbox.push.apple.com', // change to api.push.apple.com in prod
      path: `/3/device/${params.token}`,
      headers: {
        authorization: `bearer ${token}`,
        'apns-topic': bundleId,
        'content-type': 'application/json',
      },
    },
    (res) => {
      // no-op; could inspect statusCode
    }
  );
  await new Promise<void>((resolve, reject) => {
    req.on('error', reject);
    req.on('response', () => resolve());
    req.write(payload);
    req.end();
  });
  return { ok: true };
}
