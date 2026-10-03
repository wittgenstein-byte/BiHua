import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

export const SESSION_COOKIE_NAME = 'bihua_session';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Checks if running in production (or over HTTPS)
 */
function isSecureConnection(c) {
  const proto = c.req.header('x-forwarded-proto');
  const url = new URL(c.req.url);
  return proto === 'https' || url.protocol === 'https:';
}

/**
 * Sets an HttpOnly, SameSite, Secure session cookie
 */
export function setSessionCookie(c, sessionId) {
  const isSecure = isSecureConnection(c);
  
  setCookie(c, SESSION_COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Lax',
    maxAge: SESSION_MAX_AGE
  });
}

/**
 * Clears the session cookie on logout
 */
export function clearSessionCookie(c) {
  const isSecure = isSecureConnection(c);

  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Lax'
  });
}

/**
 * Retrieves the session ID from request cookies
 */
export function getSessionId(c) {
  return getCookie(c, SESSION_COOKIE_NAME) || null;
}
