import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: { username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret());
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { username: string };
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export function comparePassword(input: string, stored: string): boolean {
  return input === stored;
}
