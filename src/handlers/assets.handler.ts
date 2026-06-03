import { join } from "node:path";
import type { Context } from "hono";

const LOGO_PATH = join(import.meta.dir, "../../public/logo.webp");

export const logoHandler = (c: Context) => {
  return c.body(Bun.file(LOGO_PATH), 200, {
    "Content-Type": "image/webp",
    "Cache-Control": "public, max-age=86400",
  });
};

/** Trình duyệt mặc định request /favicon.ico */
export const faviconHandler = logoHandler;
