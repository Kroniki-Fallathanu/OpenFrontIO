import { decodeJwt } from "jose";
import { UserSettings } from "src/core/game/UserSettings";
import { z } from "zod";
import { TokenPayload, TokenPayloadSchema } from "../core/ApiSchemas";
import { base64urlToUuid } from "../core/Base64";
import { getApiBase, getAudience } from "./Api";
import { ClientEnv } from "./ClientEnv";
import { generateCryptoRandomUUID } from "./Utils";

export type UserAuth = { jwt: string; claims: TokenPayload } | false;

const PERSISTENT_ID_KEY = "player_persistent_id";

// Embedded Hexah „Dzikie Ziemie" battles open this game in an iframe and pass a
// per-battle, single-use persistentID in the URL hash (#hexPid=<uuid>). The
// embedded player must present it so they are recognized as the game's creator
// (the result webhook matches the winner against it). It is generated per battle
// by Hexah — NOT the player's real OpenFront identity — and is never written to
// localStorage, so it cannot clobber a standalone visitor's id.
const BATTLE_PID_HASH_PARAM = "hexPid";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function battlePersistentIdOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const hash = window.location.hash.replace(/^#/, "");
    const pid = new URLSearchParams(hash).get(BATTLE_PID_HASH_PARAM);
    return pid && UUID_REGEX.test(pid) ? pid : null;
  } catch {
    return null;
  }
}

let __jwt: string | null = null;
let __refreshPromise: Promise<void> | null = null;
let __expiresAt: number = 0;

export function discordLogin() {
  const redirectUri = encodeURIComponent(window.location.href);
  window.location.href = `${getApiBase()}/auth/login/discord?redirect_uri=${redirectUri}`;
}

export async function tempTokenLogin(token: string): Promise<string | null> {
  const response = await fetch(
    `${getApiBase()}/auth/login/token?login-token=${token}`,
    {
      credentials: "include",
    },
  );
  if (response.status !== 200) {
    console.error("Token login failed", response);
    return null;
  }
  const json = await response.json();
  const { email } = json;
  return email;
}

export async function getAuthHeader(): Promise<string> {
  const userAuthResult = await userAuth();
  if (!userAuthResult) return "";
  const { jwt } = userAuthResult;
  return `Bearer ${jwt}`;
}

export async function logOut(allSessions: boolean = false): Promise<boolean> {
  try {
    const response = await fetch(
      getApiBase() + (allSessions ? "/auth/revoke" : "/auth/logout"),
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (response.ok === false) {
      console.error("Logout failed", response);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Logout failed", e);
    return false;
  } finally {
    __jwt = null;
    localStorage.removeItem(PERSISTENT_ID_KEY);
    new UserSettings().clearFlag();
    new UserSettings().setSelectedPatternName(undefined);
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const userAuthResult = await userAuth();
  return userAuthResult !== false;
}

export async function userAuth(
  shouldRefresh: boolean = true,
): Promise<UserAuth> {
  if (ClientEnv.externalApiDisabled()) {
    return false;
  }
  try {
    const jwt = __jwt;
    if (!jwt) {
      if (!shouldRefresh) {
        console.warn("No JWT found and shouldRefresh is false");
        return false;
      }
      console.log("No JWT found");
      await refreshJwt();
      return userAuth(false);
    }

    // Verify the JWT (requires browser support)
    // const jwks = createRemoteJWKSet(
    //   new URL(getApiBase() + "/.well-known/jwks.json"),
    // );
    // const { payload, protectedHeader } = await jwtVerify(token, jwks, {
    //   issuer: getApiBase(),
    //   audience: getAudience(),
    // });

    const payload = decodeJwt(jwt);
    const { iss, aud } = payload;

    if (iss !== getApiBase()) {
      // JWT was not issued by the correct server
      console.error('unexpected "iss" claim value');
      logOut();
      return false;
    }
    const myAud = getAudience();
    if (myAud !== "localhost" && aud !== myAud) {
      // JWT was not issued for this website
      console.error('unexpected "aud" claim value');
      logOut();
      return false;
    }
    if (Date.now() >= __expiresAt - 3 * 60 * 1000) {
      console.log("jwt expired or about to expire");
      if (!shouldRefresh) {
        console.error("jwt expired and shouldRefresh is false");
        return false;
      }
      await refreshJwt();

      // Try to get login info again after refreshing
      return userAuth(false);
    }

    const result = TokenPayloadSchema.safeParse(payload);
    if (!result.success) {
      const error = z.prettifyError(result.error);
      console.error("Invalid payload", error);
      return false;
    }

    const claims = result.data;
    return { jwt, claims };
  } catch (e) {
    console.error("isLoggedIn failed", e);
    return false;
  }
}

async function refreshJwt(): Promise<void> {
  if (__refreshPromise) {
    return __refreshPromise;
  }
  __refreshPromise = doRefreshJwt();
  try {
    await __refreshPromise;
  } finally {
    __refreshPromise = null;
  }
}

async function doRefreshJwt(): Promise<void> {
  if (ClientEnv.externalApiDisabled()) {
    __jwt = null;
    return;
  }
  try {
    console.log("Refreshing jwt");
    const response = await fetch(getApiBase() + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (response.status !== 200) {
      console.error("Refresh failed", response);
      logOut();
      return;
    }
    const json = await response.json();
    const { jwt, expiresIn } = json;
    __expiresAt = Date.now() + expiresIn * 1000;
    console.log("Refresh succeeded");
    __jwt = jwt;
  } catch (e) {
    console.error("Refresh failed", e);
    // if server unreachable, just clear jwt
    __jwt = null;
    return;
  }
}

export async function sendMagicLink(email: string): Promise<boolean> {
  try {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/auth/magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        redirectDomain: window.location.origin,
        email: email,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error(
        "Failed to send recovery email:",
        response.status,
        response.statusText,
      );
      return false;
    }
  } catch (error) {
    console.error("Error sending recovery email:", error);
    return false;
  }
}

// WARNING: DO NOT EXPOSE THIS ID
export async function getPlayToken(): Promise<string> {
  const battlePid = battlePersistentIdOverride();
  if (battlePid) return battlePid;
  const result = await userAuth();
  if (result !== false) return result.jwt;
  return getPersistentIDFromLocalStorage();
}

// WARNING: DO NOT EXPOSE THIS ID
export function getPersistentID(): string {
  const battlePid = battlePersistentIdOverride();
  if (battlePid) return battlePid;
  const jwt = __jwt;
  if (!jwt) return getPersistentIDFromLocalStorage();
  const payload = decodeJwt(jwt);
  const sub = payload.sub;
  if (!sub) return getPersistentIDFromLocalStorage();
  return base64urlToUuid(sub);
}

// WARNING: DO NOT EXPOSE THIS ID
function getPersistentIDFromLocalStorage(): string {
  // Try to get existing localStorage
  const value = localStorage.getItem(PERSISTENT_ID_KEY);
  if (value) return value;

  // If no localStorage exists, create new ID and set localStorage
  const newID = generateCryptoRandomUUID();
  localStorage.setItem(PERSISTENT_ID_KEY, newID);

  return newID;
}
