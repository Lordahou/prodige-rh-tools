const SECRET = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return secret ?? "fallback-dev-secret-change-me";
};

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSession(email: string): Promise<string> {
  const payload = btoa(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }));
  const key = await getKey(SECRET());
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${payload}.${sigHex}`;
}

export async function verifySession(token: string): Promise<string | null> {
  try {
    const [payload, sigHex] = token.split(".");
    if (!payload || !sigHex) return null;
    const key = await getKey(SECRET());
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(payload));
    if (!valid) return null;
    const { email, exp } = JSON.parse(atob(payload));
    if (Date.now() > exp) return null;
    return email as string;
  } catch {
    return null;
  }
}
