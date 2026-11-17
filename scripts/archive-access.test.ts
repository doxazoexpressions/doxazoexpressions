import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const routes = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const protectedRoutes = [...routes.matchAll(/<Route path="([^"]+)" element=\{<RequireAuth>/g)].map((match) => match[1]);
test("Archive and today's devotional remain public", () => {
  expect(protectedRoutes).not.toContain("/archive");
  expect(protectedRoutes).not.toContain("/devotional");
});
test("all nine personal route patterns remain protected", () => {
  expect(protectedRoutes.sort()).toEqual([
    "/favorites", "/plans", "/plans/:slug", "/journal", "/highlights",
    "/prayers", "/downloads", "/goals", "/groups",
  ].sort());
});