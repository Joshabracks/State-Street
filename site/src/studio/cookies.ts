/**
 * Tiny first-party cookie helpers for persisting the Studio's themes and chosen look.
 * Functional storage only (no tracking). Values are URL-encoded; Secure is added on https.
 */
export function setCookie(name: string, value: string, days = 365): void {
  const maxAge = Math.round(days * 86400);
  const secure = location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax${secure}`;
}

export function getCookie(name: string): string {
  const prefix = name + "=";
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const p of parts) if (p.startsWith(prefix)) return decodeURIComponent(p.slice(prefix.length));
  return "";
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
}
