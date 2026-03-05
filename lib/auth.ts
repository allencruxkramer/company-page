import { SignJWT, jwtVerify } from 'jose';

type MagicLinkPayload = { email: string; type: 'magic-link' };
type SessionPayload = { email: string; type: 'session' };
type TokenPayload = MagicLinkPayload | SessionPayload;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload, expiresIn: string): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(request: Request): Promise<SessionPayload | null> {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (!match) return null;
  const payload = await verifyToken(match[1]);
  if (!payload || payload.type !== 'session') return null;
  return payload as SessionPayload;
}
