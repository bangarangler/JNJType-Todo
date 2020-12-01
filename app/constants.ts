export const COOKIE_NAME = "hank";
export const __prod__ = process.env.NODE_ENV === "production";
export const __dev__ = process.env.NODE_ENV === "production" ? "lax" : "none"; // TODO: when chrome and firefox update their browser change this to be "None; Secure" instead of none
