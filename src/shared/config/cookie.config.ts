import type { CookieAttributes } from "node_modules/@types/js-cookie";

export const cookieOptions: CookieAttributes = {
  path: "/",
  secure: location.protocol === "https:",
  sameSite: "lax",
};
