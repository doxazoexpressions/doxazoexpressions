import { describe, expect, test } from "bun:test";
import { BACKUP_BUCKETS, canExportStorage } from "./storageBackup";

describe("storage backup access", () => {
  const client = (role: boolean, valid = true) => ({
    auth: { getUser: async () => ({ data: { user: valid ? { id: "test-user" } : null }, error: null }) },
    rpc: async (name: string, args: { _user_id: string; _role: string }) => {
      expect(name).toBe("has_role");
      expect(args).toEqual({ _user_id: "test-user", _role: "admin" });
      return { data: role, error: null };
    },
  });
  test("only the three requested buckets are exported", () => {
    expect([...BACKUP_BUCKETS]).toEqual(["devotional-audio", "prayers", "audio-journal"]);
  });
  test("anonymous callers cannot export", async () => {
    expect(await canExportStorage(client(true), "")).toBe(false);
  });
  test("invalid sessions cannot export", async () => {
    expect(await canExportStorage(client(true, false), "invalid")).toBe(false);
  });
  test("signed-in non-admins cannot export", async () => {
    expect(await canExportStorage(client(false), "test-token")).toBe(false);
  });
  test("server-verified admins can export", async () => {
    expect(await canExportStorage(client(true), "test-token")).toBe(true);
  });
});