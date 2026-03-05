import 'server-only';
import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export async function getSessionEmail(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return undefined;
  const payload = await verifyToken(token);
  if (!payload || payload.type !== 'session') return undefined;
  return payload.email;
}
